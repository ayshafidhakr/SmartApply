import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

console.log("🔔 Webhook route file loaded");

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    console.log("🔔 WEBHOOK HIT AT", new Date().toISOString());

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
        console.error("No signature header present");
        return NextResponse.json({ error: "Missing signature " }, { status: 400 });
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(rawBody)
        .digest("hex");

    if (expectedSignature != signature) {
        console.error("Webhook signature mismatch - possible forgeed request");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log("🔔 Event Type:", event.event);

    if (event.event === "order.paid") {
        const order = event.payload.order.entity;
        const userId = order.notes?.user_id;

        if (!userId) {
            console.error("Webhook recieved with no user_id in order notes");
            return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
        }

        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const { error } = await supabaseAdmin
            .from("subscriptions")
            .upsert(
                {
                    user_id: userId,
                    status: "active",
                    current_period_end: periodEnd.toISOString(),
                },
                { onConflict: "user_id" }
            );

        if (error) {
            console.error("Failed to activate subscription:", error);
            return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }

        console.log("✅ Subscription activated for user:", userId);
    }
    return NextResponse.json({ recieved: true });
}
