"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Stepper, { Step } from "@/src/components/Stepper";

const steps = [
  {
    icon: "🎯",
    title: "Land more interviews",
    subtitle: "Stop sending generic resumes",
    description:
      "SmartApply analyzes any job description and tells you exactly how well your resume matches — with a score from 0 to 100.",
    highlight: "Know your chances before you apply.",
    color: "from-violet-500/20 to-transparent",
    border: "border-violet-500/30",
  },
  {
    icon: "✍️",
    title: "AI rewrites your resume",
    subtitle: "Tailored bullets in seconds",
    description:
      "Our AI rewrites your resume bullet points using keywords and language from the job description — the exact way ATS systems and recruiters want to see it.",
    highlight: "Sound like the perfect candidate every time.",
    color: "from-indigo-500/20 to-transparent",
    border: "border-indigo-500/30",
  },
  {
    icon: "📄",
    title: "Instant cover letters",
    subtitle: "No more blank page anxiety",
    description:
      "Get a fully tailored, professional cover letter generated from your resume and the job description in one click. Edit it, copy it, send it.",
    highlight: "Every application unique. Zero effort.",
    color: "from-blue-500/20 to-transparent",
    border: "border-blue-500/30",
  },
  {
    icon: "💡",
    title: "Close your skill gaps",
    subtitle: "Know exactly what to learn",
    description:
      "SmartApply shows you which skills from the job description are missing from your resume, and which ones you already have but aren't highlighting enough.",
    highlight: "Level up your career with clarity.",
    color: "from-purple-500/20 to-transparent",
    border: "border-purple-500/30",
  },
];

export default function OnboardingPage() {
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  function handleComplete() {
    setCompleted(true);
    setTimeout(() => router.push("/signup"), 600);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          SmartApply
        </span>
        <p className="text-gray-500 text-sm">Your AI-powered job application assistant</p>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-lg">
        <Stepper
          initialStep={1}
          onFinalStepCompleted={handleComplete}
          nextButtonText="Next →"
          backButtonText="← Back"
          disableStepIndicators={false}
        >
          {steps.map((step, i) => (
            <Step key={i}>
              <div className={`rounded-2xl bg-gradient-to-br ${step.color} border ${step.border} p-6 mb-6 flex flex-col gap-4`}>
                <span className="text-5xl">{step.icon}</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    {step.subtitle}
                  </p>
                  <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
                <p className="text-violet-300 text-sm font-medium italic">
                  "{step.highlight}"
                </p>
              </div>
            </Step>
          ))}
        </Stepper>
      </div>

      {/* Skip */}
      <button
        onClick={() => router.push("/signup")}
        className="mt-6 text-m text-gray-600 hover:text-gray-400 transition"
      >
        Skip intro → Go to signup
      </button>

      {/* Already have account */}
      <p className="mt-3 text-s text-gray-600">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/login")}
          className="text-violet-400 hover:underline"
        >
          Login
        </button>
      </p>
    </main>
  );
}