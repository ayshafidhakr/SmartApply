"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/src/store/useAnalysisStore";

interface Application {
    id: string;
    match_score: number;
    company_name: string;
    job_title: string;
    created_at: string;
    job_description: string;
}

export default function HistoryPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingId, setFetchingId] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [showExpiredModal, setShowExpiredModal] = useState(false);

    const router = useRouter();
    const { setResult } = useAnalysisStore();

    const isExpired = (createdAtString: string) => {
        const createdAt = new Date(createdAtString);
        const now = new Date();
        const diffTime = now.getTime() - createdAt.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays > 30;
    };

    useEffect(() => {
        async function fetchHistory() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("applications")
                .select("id, match_score, company_name, job_title, created_at, job_description")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (!error && data) setApplications(data);
            setLoading(false);
        }
        fetchHistory();
    }, []);

    const handleCardClick = async (appId: string) => {
        if (fetchingId) return;
        setFetchingId(appId);
        setFetchError(null);

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("applications")
                .select("match_score, rewritten_bullets, cover_letter, skill_suggestions")
                .eq("id", appId)
                .single();

            if (error || !data) {
                throw new Error(error?.message || "Failed to fetch application details.");
            }

            let skills = { highlight: [], learn: [] };
            if (data.skill_suggestions) {
                try {
                    skills = typeof data.skill_suggestions === "string"
                        ? JSON.parse(data.skill_suggestions)
                        : data.skill_suggestions;
                } catch (e) {
                    console.error("Error parsing skill suggestions", e);
                }
            }

            setResult({
                score: data.match_score,
                rewrittenBullets: data.rewritten_bullets || "",
                coverLetter: data.cover_letter || "",
                skills,
            });

            router.push("/dashboard/results?from=history");
        } catch (err: any) {
            console.error("Error in card click handler", err);
            setFetchError(err.message || "Failed to load analysis results. Please try again.");
        } finally {
            setFetchingId(null);
        }
    };

    const scoreColor = (score: number) =>
        score >= 75 ? "text-green-400"
            : score >= 50 ? "text-yellow-400"
                : "text-red-400";

    const scoreBadge = (score: number) =>
        score >= 75 ? "bg-green-900/30 border-green-700 text-green-300"
            : score >= 50 ? "bg-yellow-900/30 border-yellow-700 text-yellow-300"
                : "bg-red-900/30 border-red-700 text-red-300";

    return (
        <main className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-8">
            {/* Back + Header */}
            <div className="flex flex-col gap-3">
                <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-violet-500/50 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-violet-900/20 active:scale-[0.98] hover:-translate-y-0.5 w-fit"
                >
                    <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
                    <span>Back to Dashboard</span>
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <div>
                        <h1 className="text-3xl font-bold">Application History</h1>
                        <p className="text-gray-400 mt-1">All your past analyses in one place.</p>
                    </div>
                    <Link
                        href="/dashboard/analyze"
                        className="group inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-violet-900/25 border border-violet-500/20 active:scale-[0.98] hover:-translate-y-0.5 w-fit"
                    >
                        <span className="inline-block transition-transform duration-300 group-hover:rotate-90">+</span>
                        <span>New Analysis</span>
                    </Link>
                </div>
            </div>

            {fetchError && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
                    {fetchError}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse h-24"
                        />
                    ))}
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 flex flex-col items-center gap-4">
                    <span className="text-5xl">📭</span>
                    <p className="text-gray-400 text-lg font-medium">No analyses yet</p>
                    <p className="text-gray-600 text-sm">Start by analyzing your first resume</p>
                    <Link
                        href="/dashboard/analyze"
                        className="group mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg shadow-violet-900/30 border border-violet-500/20 active:scale-[0.98] hover:-translate-y-0.5"
                    >
                        <span>Start First Analysis</span>
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {applications.map((app) => {
                        const expired = isExpired(app.created_at);
                        return (
                            <div
                                key={app.id}
                                onClick={() => {
                                    if (expired) {
                                        setShowExpiredModal(true);
                                    } else {
                                        handleCardClick(app.id);
                                    }
                                }}
                                className={`bg-gray-900 border border-gray-800 hover:border-violet-500/50 rounded-2xl p-6 flex items-center justify-between transition group cursor-pointer relative ${fetchingId ? "pointer-events-none opacity-60" : ""
                                    } ${expired ? "hover:border-red-500/30 opacity-75" : ""
                                    }`}
                            >
                                <div className="flex flex-col gap-1">
                                    <p className="font-semibold text-lg group-hover:text-violet-300 transition">
                                        {app.job_title || "Software Developer Role"}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        {app.company_name || "Company not specified"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-gray-600 text-xs">
                                            {new Date(app.created_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        {expired && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/40 border border-red-900/50 text-red-400 font-medium">
                                                Archived
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 min-w-[80px]">
                                    {fetchingId === app.id ? (
                                        <div className="flex flex-col items-center gap-1.5 py-1">
                                            <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                                            <span className="text-[10px] text-violet-400 font-medium">Loading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className={`text-4xl font-extrabold ${scoreColor(app.match_score)}`}>
                                                {app.match_score}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${scoreBadge(app.match_score)}`}>
                                                {app.match_score >= 75 ? "Strong" : app.match_score >= 50 ? "Decent" : "Weak"} match
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Expiration Warning Modal */}
            {showExpiredModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-5xl">⚠️</span>
                        <h3 className="text-xl font-bold text-white">Analysis Session Expired</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Analyses older than 30 days are automatically archived. Only the match score and role details remain accessible.
                        </p>
                        <button
                            onClick={() => setShowExpiredModal(false)}
                            className="w-full bg-red-900/30 hover:bg-red-800/40 border border-red-700 text-red-200 py-2.5 rounded-xl font-semibold transition active:scale-[0.98]"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}