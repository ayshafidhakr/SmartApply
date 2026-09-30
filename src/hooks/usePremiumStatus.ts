"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";

export function usePremiumStatus() {
    const [isPremium, setIsPremium] = useState<boolean | null>(null);

    useEffect(() => {
        async function check() {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setIsPremium(false);
                return;
            }

            const { data } = await supabase
                .from("subscriptions")
                .select("status, current_period_end")
                .eq("user_id", user.id)
                .single();

            const active =
                data?.status === "active" &&
                data?.current_period_end &&
                new Date(data.current_period_end) > new Date();

            setIsPremium(!!active);
        }

        check();
    }, []);

    return isPremium; // null = loading, true/false once resolved
}