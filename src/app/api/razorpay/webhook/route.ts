import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const PLAN_DURATIONS: Record<string, number> = {
    premium: 1, // months
    pro: 2,     // months
};

export async function POST(req: Request) {
    console.log("🔔 WEBHOOK HIT AT", new Date().toISOString());

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
        console.error("No signature header present");
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(rawBody)
        .digest("hex");

    if (expectedSignature !== signature) {
        console.error("Webhook signature mismatch — possible forged request");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log("🔔 Event type:", event.event);

    if (event.event === "order.paid") {
        const order = event.payload.order.entity;
        const userId = order.notes?.user_id;
        const plan = order.notes?.plan;

        if (!userId || !plan || !PLAN_DURATIONS[plan]) {
            console.error("Webhook received with missing/invalid user_id or plan", { userId, plan });
            return NextResponse.json({ error: "Missing user_id or plan" }, { status: 400 });
        }

        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + PLAN_DURATIONS[plan]);

        const { error } = await supabaseAdmin
            .from("subscriptions")
            .upsert(
                {
                    user_id: userId,
                    status: "active",
                    plan,
                    current_period_end: periodEnd.toISOString(),
                },
                { onConflict: "user_id" }
            );

        if (error) {
            console.error("Failed to activate subscription:", error);
            return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }

        console.log(`✅ ${plan} subscription activated for user:`, userId);
    }

    return NextResponse.json({ received: true });
}