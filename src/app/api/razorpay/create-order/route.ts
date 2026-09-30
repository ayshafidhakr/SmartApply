import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/src/lib/supabase/server";

const PLAN_PRICES: Record<string, number> = {
    premium: 29900, // ₹299.00 in paise
    pro: 49900,     // ₹499.00 in paise
};

export async function POST(req: Request) {
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PLAN_PRICES[plan]) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    try {
        const order = await razorpay.orders.create({
            amount: PLAN_PRICES[plan],
            currency: "INR",
            receipt: `prem_${user.id.slice(0, 8)}_${Date.now()}`,
            notes: {
                user_id: user.id,
                plan, // "premium" or "pro" — read by the webhook
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error("Razorpay order creation failed:", err);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}