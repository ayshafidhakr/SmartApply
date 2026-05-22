"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import DotGrid from "@/src/components/DotGrid";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [email, setEmail] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setEmail(user.email);
        }
        getUser();
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    const navLinks = [
        { href: "/dashboard", label: "Home" },
        { href: "/dashboard/analyze", label: "New Analysis" },
        { href: "/dashboard/history", label: "History" },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
            {/* Animated Dot Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <DotGrid
                    dotSize={3}
                    gap={24}
                    baseColor="#312e81"
                    activeColor="#c084fc"
                    proximity={180}
                    shockRadius={240}
                    shockStrength={6}
                />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Premium Navbar */}
                <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <span className="text-xl font-extrabold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                SmartApply
                            </span>
                        </Link>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg text-sm transition
                      ${pathname === link.href
                                            ? "bg-violet-600/20 text-violet-300 font-medium"
                                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* User + Logout */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold">
                                    {email?.[0]?.toUpperCase() ?? "U"}
                                </div>
                                <span className="text-sm text-gray-300 max-w-[150px] truncate">
                                    {email}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-400 hover:text-red-400 bg-gray-900 border border-gray-800 hover:border-red-800 px-3 py-1.5 rounded-lg transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Page Content */}
                {children}
            </div>
        </div>
    );
}