"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    async function handleSignup() {
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setIsSignedUp(true);
            setLoading(false);
        }
    }

    if (isSignedUp) {
        return (
            <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-4xl animate-pulse">
                            ✉️
                        </div>
                        <h1 className="text-2xl font-bold text-white mt-2">Verify your email</h1>
                        <p className="text-gray-400 text-sm">
                            We&apos;ve sent a verification link to <span className="text-violet-300 font-semibold">{email}</span>.
                        </p>
                        <p className="text-gray-500 text-xs mt-2 max-w-xs">
                            Please check your inbox (and spam folder) and click the link to confirm your account and access your dashboard.
                        </p>
                    </div>

                    <div className="border-t border-gray-800 my-2"></div>

                    <Link
                        href="/login"
                        className="bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-lg font-semibold transition text-center"
                    >
                        Back to Login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-gray-400 text-sm mt-1">Start using SmartApply for free</p>
                </div>

                {error && (
                    <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
                        {error}
                    </p>
                )}

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition"
                >
                    {loading ? "Creating account..." : "Sign up"}
                </button>

                <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-violet-400 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}