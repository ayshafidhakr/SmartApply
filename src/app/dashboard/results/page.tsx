"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAnalysisStore } from "@/src/store/useAnalysisStore";

function ResultsContent() {
    const { result, setIsAnalyzing } = useAnalysisStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromHistory = searchParams.get("from") === "history";

    useEffect(() => {
        setIsAnalyzing(false);
        if (!result) router.push("/dashboard/analyze");
    }, [result, router, setIsAnalyzing]);

    if (!result) return null;

    const scoreColor =
        result.score >= 75 ? "text-green-400"
            : result.score >= 50 ? "text-yellow-400"
                : "text-red-400";

    const scoreBg =
        result.score >= 75 ? "from-green-900/20 to-green-800/5 border-green-800/50"
            : result.score >= 50 ? "from-yellow-900/20 to-yellow-800/5 border-yellow-800/50"
                : "from-red-900/20 to-red-800/5 border-red-800/50";

    const scoreLabel =
        result.score >= 75 ? "Strong Match 🎉"
            : result.score >= 50 ? "Decent Match 👍"
                : "Needs Work 💪";

    return (
        <main className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-8">
            {/* Back + Header */}
            <div className="flex flex-col gap-3">
                <Link
                    href={fromHistory ? "/dashboard/history" : "/dashboard/analyze"}
                    className="group inline-flex items-center gap-2 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-violet-500/50 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-violet-900/20 active:scale-[0.98] hover:-translate-y-0.5 w-fit"
                >
                    <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
                    <span>{fromHistory ? "Back to History" : "New Analysis"}</span>
                </Link>
                <h1 className="text-3xl font-bold mt-2">Your Results</h1>
                <p className="text-gray-400">Here's how your resume matches this job.</p>
            </div>

            {/* Score */}
            <div className={`bg-gradient-to-br ${scoreBg} border rounded-2xl p-8 flex flex-col items-center gap-2`}>
                <p className="text-gray-400 text-sm uppercase tracking-widest">Match Score</p>
                <p className={`text-9xl font-extrabold ${scoreColor}`}>{result.score}</p>
                <p className="text-gray-400 text-sm">out of 100</p>
                <span className={`mt-2 text-sm font-semibold px-4 py-1 rounded-full border
          ${result.score >= 75
                        ? "bg-green-900/30 border-green-700 text-green-300"
                        : result.score >= 50
                            ? "bg-yellow-900/30 border-yellow-700 text-yellow-300"
                            : "bg-red-900/30 border-red-700 text-red-300"
                    }`}>
                    {scoreLabel}
                </span>
            </div>

            {/* Rewritten Bullets */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">✍️ Rewritten Resume Bullets</h2>
                    <button
                        onClick={() => navigator.clipboard.writeText(result.rewrittenBullets)}
                        className="text-xs text-gray-400 hover:text-white bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-violet-500/50 px-3.5 py-1.5 rounded-lg transition-all duration-300 active:scale-[0.95]"
                    >
                        Copy
                    </button>
                </div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {result.rewrittenBullets}
                </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">📄 Cover Letter</h2>
                    <button
                        onClick={() => navigator.clipboard.writeText(result.coverLetter)}
                        className="text-xs text-gray-400 hover:text-white bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-violet-500/50 px-3.5 py-1.5 rounded-lg transition-all duration-300 active:scale-[0.95]"
                    >
                        Copy
                    </button>
                </div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {result.coverLetter}
                </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-6">
                <h2 className="text-xl font-semibold">💡 Skill Suggestions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                        <p className="text-green-400 font-medium text-sm uppercase tracking-widest">
                            ✅ Highlight These
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {result.skills.highlight.map((skill) => (
                                <span
                                    key={skill}
                                    className="bg-green-900/30 border border-green-700 text-green-300 text-sm px-3 py-1 rounded-full"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <p className="text-yellow-400 font-medium text-sm uppercase tracking-widest">
                            📚 Learn These
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {result.skills.learn.map((skill) => (
                                <span
                                    key={skill}
                                    className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 text-sm px-3 py-1 rounded-full"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/dashboard/analyze"
                    className="group flex-1 text-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-violet-900/40 border border-violet-500/20 active:scale-[0.99] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <span>Analyze Another Job</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
                <Link
                    href="/dashboard/history"
                    className="flex-1 text-center bg-gray-900/60 hover:bg-gray-900 border border-gray-850 hover:border-gray-700 text-gray-300 hover:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 active:scale-[0.99] hover:-translate-y-0.5 shadow-sm hover:shadow-black/20"
                >
                    View History
                </Link>
            </div>
        </main>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <main className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-8 text-center text-gray-400">
                <div className="flex flex-col items-center gap-4 py-20">
                    <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-medium">Loading analysis results...</p>
                </div>
            </main>
        }>
            <ResultsContent />
        </Suspense>
    );
}