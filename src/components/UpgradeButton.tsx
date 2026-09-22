"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import SpecularButton from "@/src/components/SpecularButton";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function UpgradeButton() {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch("/api/razorpay/create-order", { method: "POST" });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Something went wrong. Please try again.");
                setLoading(false);
                return;
            }

            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "SmartApply Premium",
                description: "Unlock AI email generation",
                order_id: data.orderId,
                prefill: { email: user?.email ?? "" },
                theme: { color: "#6366f1" },
                handler: function () {
                    alert("Payment successful! Your premium features will unlock shortly.");
                    window.location.reload();
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Upgrade failed:", err);
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <SpecularButton
            size="lg"
            radius={18}
            tint="#ffffff"
            tintOpacity={0}
            blur={0}
            textColor="#f5f5f5"
            lineColor="#ffffff"
            baseColor="#525252"
            intensity={1}
            shineSize={10}
            shineFade={40}
            thickness={1}
            speed={0.35}
            followMouse
            proximity={250}
            autoAnimate={false}
            onClick={handleUpgrade}
        >
            {loading ? "Processing..." : "✨ Upgrade to Premium"}
        </SpecularButton>
    );
}