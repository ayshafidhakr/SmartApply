import { createClient } from "@/src/lib/supabase/server";

export async function isPremiumUser(): Promise<boolean> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", user.id)
        .single();

    if (error || !data) return false;

    const isActive = data.status === "active";
    const notExpired = data.current_period_end
        ? new Date(data.current_period_end) > new Date()
        : false;

    return isActive && notExpired;
}