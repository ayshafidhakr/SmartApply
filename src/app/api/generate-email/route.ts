import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { isPremiumUser } from "@/src/lib/subscription";

export async function POST(req: NextRequest) {
    try {
        const premium = await isPremiumUser();

        if (!premium) {
            return NextResponse.json(
                { error: "This feature requires SmartApply Premium." },
                { status: 403 }
            );
        }

        const { resumeText, jobDescription } = await req.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: "Resume text and job description are required" },
                { status: 400 }
            );
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const truncatedResume = resumeText.slice(0, 2000);
        const truncatedJD = jobDescription.slice(0, 1500);

        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "user",
                    content: `Write a short, warm, professional outreach email to a hiring manager, based on this resume and job description. 

Rules:
- Sound like a real person wrote it — natural phrasing, no corporate buzzwords like "leverage" or "synergy"
- Vary sentence length, don't make every sentence the same structure
- No generic AI phrases like "I am excited to apply" or "I believe I would be a great fit"
- Keep it under 150 words
- End with a simple, low-pressure call to action

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJD}`,
                },
            ],
            max_tokens: 400,
            temperature: 0.9,
            reasoning_effort: "low",
        } as any);

        const email = response.choices[0]?.message?.content ?? "";

        return NextResponse.json({ email });
    } catch (error) {
        console.error("Email generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate email" },
            { status: 500 }
        );
    }
}