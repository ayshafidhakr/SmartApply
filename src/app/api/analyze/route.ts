import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/src/lib/supabase/server";

export const maxDuration = 60;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function askGroq(prompt: string, maxTokens: number = 500): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume text and job description are required" },
        { status: 400 }
      );
    }

    const truncatedResume = resumeText.slice(0, 2000);
    const truncatedJD = jobDescription.slice(0, 1500);

    // Run all 4 in parallel — Groq handles it easily
    const [scoreText, rewrittenBullets, coverLetter, skillsText] =
      await Promise.all([

        askGroq(
          `You are a recruiter. Return ONLY a number from 0-100 for how well this resume matches the job. Just the number, nothing else.

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJD}`,
          10
        ),

        askGroq(
          `Rewrite these resume bullet points to better match the job description. Use strong action verbs and relevant keywords. Return only bullets starting with •.

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJD}`,
          500
        ),

        askGroq(
          `Write a professional 3 paragraph cover letter based on this resume and job description. Be specific and compelling.

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJD}`,
          500
        ),

        askGroq(
          `Analyze the gap between this resume and job description. Return ONLY this JSON format, no explanation, no markdown:
{"highlight": ["skill1", "skill2"], "learn": ["skill3", "skill4"]}

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJD}`,
          200
        ),
      ]);

    // Parse score
    const score = parseInt(scoreText.trim().match(/\d+/)?.[0] ?? "0");

    // Parse skills
    let skills: { highlight: string[]; learn: string[] } = {
      highlight: [],
      learn: [],
    };
    try {
      const jsonMatch = skillsText.match(/\{[\s\S]*\}/);
      if (jsonMatch) skills = JSON.parse(jsonMatch[0]);
    } catch {
      skills = { highlight: [], learn: [] };
    }

    // Save to Supabase
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("applications").insert({
          user_id: user.id,
          job_description: jobDescription,
          resume_text: resumeText,
          match_score: score,
          rewritten_bullets: rewrittenBullets,
          cover_letter: coverLetter,
          skill_suggestions: JSON.stringify(skills),
        });
      }
    } catch (dbError) {
      console.error("Failed to save to database:", dbError);
    }

    return NextResponse.json({
      score,
      rewrittenBullets,
      coverLetter,
      skills,
    });

  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}