import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/src/lib/supabase/server"; // your existing server client

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PREMIUM_PRICE_PAISE = 29900; // ₹299.00 — Razorpay amounts are in paise

export async function POST() {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const order = await razorpay.orders.create({
            amount: PREMIUM_PRICE_PAISE,
            currency: "INR",
            receipt: `premium_${user.id}_${Date.now()}`,
            notes: {
                user_id: user.id, // critical — the webhook reads this to know who paid
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