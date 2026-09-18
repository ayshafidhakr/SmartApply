import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/src/lib/supabase/server";

export const maxDuration = 60;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface AnalysisPayload {
  score: number;
  rewrittenBullets: string;
  coverLetter: string;
  skills: {
    highlight: string[];
    learn: string[];
  };
}

async function queryGroqModel(model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content ?? "";
}

async function analyzeResumeWithGroq(resumeText: string, jobDescription: string): Promise<AnalysisPayload> {
  const systemPrompt = `You are an expert ATS (Applicant Tracking System) recruiter and career coach.
Analyze the provided resume against the job description and output ONLY a valid JSON object matching this exact schema:
{
  "score": <number between 0 and 100 based on true match quality, skills alignment, and relevant experience>,
  "rewrittenBullets": "<3 to 5 impactful, rewritten resume bullet points tailored to the job description, each starting with • on a new line>",
  "coverLetter": "<a tailored, compelling 3-paragraph professional cover letter>",
  "skills": {
    "highlight": ["<skill1>", "<skill2>", "<skill3>"],
    "learn": ["<missing_skill1>", "<missing_skill2>", "<missing_skill3>"]
  }
}

Guidelines:
- Do not output any prose, commentary, or markdown formatting outside of the JSON object.
- The score should accurately reflect how well candidate experience and technical skills align with job requirements (0-100). Do not default to 50. High relevance should be 80-95, moderate 60-79, poor <60.
- "highlight" skills must be key technologies/skills present in both resume and job description.
- "learn" skills must be important skills/tools required in the job description but missing or weak in the resume.
- "rewrittenBullets" must be 3-5 action-oriented bullet points tailored to job keywords, each starting with "• ".`;

  const userPrompt = `RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  const models = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"];
  let rawResponse = "";

  for (const model of models) {
    try {
      rawResponse = await queryGroqModel(model, systemPrompt, userPrompt);
      if (rawResponse && rawResponse.trim().length > 0) {
        break;
      }
    } catch (err) {
      console.warn(`Groq model ${model} failed, trying next fallback:`, err);
    }
  }

  if (!rawResponse) {
    throw new Error("No response received from AI models");
  }

  let cleaned = rawResponse.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid JSON structure in model response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 75;
  const rewrittenBullets = typeof parsed.rewrittenBullets === "string" && parsed.rewrittenBullets.trim()
    ? parsed.rewrittenBullets
    : "• Tailored experience to match key job requirements.\n• Highlighted core technical skills relevant to role.";
  const coverLetter = typeof parsed.coverLetter === "string" && parsed.coverLetter.trim()
    ? parsed.coverLetter
    : "Dear Hiring Manager,\n\nI am excited to submit my application for this role...";
  const highlight = Array.isArray(parsed.skills?.highlight)
    ? parsed.skills.highlight.filter((s: any) => typeof s === "string" && s.trim().length > 0)
    : [];
  const learn = Array.isArray(parsed.skills?.learn)
    ? parsed.skills.learn.filter((s: any) => typeof s === "string" && s.trim().length > 0)
    : [];

  return {
    score,
    rewrittenBullets,
    coverLetter,
    skills: {
      highlight,
      learn,
    },
  };
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

    const truncatedResume = resumeText.slice(0, 10000);
    const truncatedJD = jobDescription.slice(0, 6000);

    const result = await analyzeResumeWithGroq(truncatedResume, truncatedJD);

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("applications").insert({
          user_id: user.id,
          job_description: jobDescription,
          resume_text: resumeText,
          match_score: result.score,
          rewritten_bullets: result.rewrittenBullets,
          cover_letter: result.coverLetter,
          skill_suggestions: JSON.stringify(result.skills),
        });
      }
    } catch (dbError) {
      console.error("Failed to save to database:", dbError);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}