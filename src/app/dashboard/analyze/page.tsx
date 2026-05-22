"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/src/store/useAnalysisStore";
import Link from "next/link";

export default function AnalyzePage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const router = useRouter();

  const {
    isAnalyzing, setIsAnalyzing,
    setResult, setError, error,
    steps, setStepActive, setStepDone, resetSteps,
  } = useAnalysisStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setResumeFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  async function handleAnalyze() {
    if (!resumeFile || !jobDescription.trim()) {
      setError("Please upload a resume and enter a job description.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    resetSteps();

    try {
      setStepActive(0);
      const formData = new FormData();
      formData.append("file", resumeFile);

      const extractRes = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });
      const extractData = await extractRes.json();

      if (!extractRes.ok || !extractData.text) {
        throw new Error("Failed to extract resume text");
      }
      setStepDone(0);

      setStepActive(1);
      setTimeout(() => setStepActive(2), 15000);
      setTimeout(() => setStepActive(3), 30000);
      setTimeout(() => setStepActive(4), 45000);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: extractData.text,
          jobDescription,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");

      setStepDone(1);
      setStepDone(2);
      setStepDone(3);
      setStepDone(4);

      setResult(analyzeData);
      router.push("/dashboard/results");

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-8 py-12 flex flex-col gap-8">
      {/* Back + Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-violet-500/50 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-violet-900/20 active:scale-[0.98] hover:-translate-y-0.5 w-fit"
        >
          <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold mt-2">New Analysis</h1>
        <p className="text-gray-400">
          Upload your resume and paste the job description below.
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Progress */}
      {isAnalyzing && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-sm text-violet-300 font-medium">
            ⏳ Analyzing your resume — this takes 1-2 minutes...
          </p>
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${step.done
                    ? "bg-green-500 text-white"
                    : step.active
                      ? "bg-violet-500 text-white animate-pulse"
                      : "bg-gray-800 text-gray-600"
                  }`}
              >
                {step.done ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm transition-all
                  ${step.done
                    ? "text-green-400"
                    : step.active
                      ? "text-violet-300 font-medium"
                      : "text-gray-600"
                  }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isAnalyzing && (
        <>
          {/* PDF Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">
              Resume (PDF)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition
                ${isDragActive
                  ? "border-violet-500 bg-violet-900/20"
                  : resumeFile
                    ? "border-green-500 bg-green-900/10"
                    : "border-gray-700 hover:border-violet-600 bg-gray-900"
                }`}
            >
              <input {...getInputProps()} />
              {resumeFile ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">✅</span>
                  <p className="text-green-400 font-medium">{resumeFile.name}</p>
                  <p className="text-gray-500 text-sm">Click or drag to replace</p>
                </div>
              ) : isDragActive ? (
                <p className="text-violet-400">Drop your PDF here...</p>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📄</span>
                  <p className="text-gray-300">Drag & drop your resume here</p>
                  <p className="text-gray-500 text-sm">or click to browse — PDF only</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none transition"
            />
          </div>

          <button
            onClick={handleAnalyze}
            className="group w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3.5 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-violet-900/40 border border-violet-500/20 active:scale-[0.99] hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>Analyze My Resume</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </>
      )}
    </main>
  );
}