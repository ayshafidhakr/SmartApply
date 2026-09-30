"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import SpecularButton from "@/src/components/SpecularButton";

declare global {
    interface Window {
        Razorpay: any;
    }
}

type Plan = "premium" | "pro";

const PLAN_DETAILS: Record<
    Plan,
    { name: string; price: number; duration: string; features: string[] }
> = {
    premium: {
        name: "Premium",
        price: 299,
        duration: "1 month",
        features: [
            "Unlimited resume analysis",
            "AI-rewritten bullet points",
            "Instant cover letters",
            "Skill gap insights",
        ],
    },
    pro: {
        name: "Pro Premium",
        price: 499,
        duration: "2 months",
        features: [
            "Everything in Premium",
            "2 months of unlimited analysis",
            "AI-generated, humanized outreach emails",
            "Priority feature access",
        ],
    },
};

export default function UpgradeButton() {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState<Plan | null>(null);

    const openCheckout = async (plan: Plan) => {
        setLoading(plan);
        try {
            const res = await fetch("/api/razorpay/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Something went wrong. Please try again.");
                setLoading(null);
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
                name: `SmartApply ${PLAN_DETAILS[plan].name}`,
                description:
                    plan === "pro" ? "Unlock AI email generation" : "Unlimited resume analysis",
                order_id: data.orderId,
                prefill: { email: user?.email ?? "" },
                theme: { color: "#6366f1" },
                handler: function () {
                    alert("Payment successful! Your premium features will unlock shortly.");
                    window.location.reload();
                },
                modal: {
                    ondismiss: function () {
                        setLoading(null);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            setShowModal(false);
        } catch (err) {
            console.error("Upgrade failed:", err);
            alert("Something went wrong. Please try again.");
            setLoading(null);
        }
    };

    return (
        <>
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
                onClick={() => setShowModal(true)}
            >
                ✨ Upgrade to Premium
            </SpecularButton>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 overflow-y-auto py-8">
                    <div className="max-w-3xl w-full flex flex-col gap-8">
                        {/* Header */}
                        <div className="text-center flex flex-col gap-2">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                Experience the Premium Job Hunt
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Choose the plan that fits how seriously you're applying.
                            </p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 text-gray-500 hover:text-white text-2xl leading-none"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
                            {/* Premium card — slight left tilt */}
                            <div className="flex-1 md:-rotate-2 hover:rotate-0 transition-transform duration-300 bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {PLAN_DETAILS.premium.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm">{PLAN_DETAILS.premium.duration}</p>
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    ₹{PLAN_DETAILS.premium.price}
                                </div>
                                <ul className="flex flex-col gap-2 text-sm text-gray-300 flex-1">
                                    {PLAN_DETAILS.premium.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2">
                                            <span className="text-violet-400">✓</span>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => openCheckout("premium")}
                                    disabled={loading !== null}
                                    className="py-3 rounded-xl border border-violet-500/50 text-violet-300 hover:bg-violet-500/10 transition font-semibold disabled:opacity-50"
                                >
                                    {loading === "premium" ? "Processing..." : "Choose Premium"}
                                </button>
                            </div>

                            {/* Pro card — slight right tilt, highlighted */}
                            <div className="flex-1 md:rotate-2 hover:rotate-0 transition-transform duration-300 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/40 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl shadow-violet-900/30 relative">
                                <span className="absolute -top-3 right-6 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    BEST VALUE
                                </span>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {PLAN_DETAILS.pro.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm">{PLAN_DETAILS.pro.duration}</p>
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    ₹{PLAN_DETAILS.pro.price}
                                </div>
                                <ul className="flex flex-col gap-2 text-sm text-gray-200 flex-1">
                                    {PLAN_DETAILS.pro.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2">
                                            <span className="text-violet-300">✓</span>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => openCheckout("pro")}
                                    disabled={loading !== null}
                                    className="py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold transition disabled:opacity-50"
                                >
                                    {loading === "pro" ? "Processing..." : "Choose Pro"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}