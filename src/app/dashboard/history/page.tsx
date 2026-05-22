"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Link from "next/link";

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

    useEffect(() => {
        async function fetchHistory() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("applications")
                .select("id, match_score, company_name, job_title, created_at, job_description")
                .order("created_at", { ascending: false });

            if (!error && data) setApplications(data);
            setLoading(false);
        }
        fetchHistory();
    }, []);

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
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-gray-900 border border-gray-800 hover:border-violet-700 rounded-2xl p-6 flex items-center justify-between transition group"
                        >
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-lg group-hover:text-violet-300 transition">
                                    {app.job_title || "Software Developer Role"}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {app.company_name || "Company not specified"}
                                </p>
                                <p className="text-gray-600 text-xs mt-1">
                                    {new Date(app.created_at).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-4xl font-extrabold ${scoreColor(app.match_score)}`}>
                                    {app.match_score}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${scoreBadge(app.match_score)}`}>
                                    {app.match_score >= 75 ? "Strong" : app.match_score >= 50 ? "Decent" : "Weak"} match
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}