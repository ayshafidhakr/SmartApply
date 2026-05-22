import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="max-w-5xl mx-auto px-8 py-12 flex flex-col gap-10">
      {/* Hero */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-extrabold">
          Your AI Job Application{" "}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Assistant
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Upload your resume, paste any job description, and get an instant AI-powered analysis.
        </p>
        <Link
          href="/dashboard/analyze"
          className="group mt-2 w-fit inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-violet-900/40 border border-violet-500/20 active:scale-[0.98] hover:-translate-y-0.5"
        >
          <span>Start New Analysis</span>
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: "🎯",
            title: "Match Score",
            desc: "See exactly how well your resume fits the role.",
            color: "from-violet-900/30 to-violet-800/10",
            border: "border-violet-800/50",
          },
          {
            icon: "✍️",
            title: "Rewrite Bullets",
            desc: "AI rewrites your resume to match the job perfectly.",
            color: "from-indigo-900/30 to-indigo-800/10",
            border: "border-indigo-800/50",
          },
          {
            icon: "📄",
            title: "Cover Letter",
            desc: "Get a tailored cover letter in one click.",
            color: "from-blue-900/30 to-blue-800/10",
            border: "border-blue-800/50",
          },
          {
            icon: "💡",
            title: "Skill Gaps",
            desc: "Know exactly which skills to highlight or learn.",
            color: "from-purple-900/30 to-purple-800/10",
            border: "border-purple-800/50",
          },
        ].map((f) => (
          <div
            key={f.title}
            className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-6 flex flex-col gap-3`}
          >
            <span className="text-3xl">{f.icon}</span>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/analyze"
          className="group bg-gray-900/60 border border-gray-800 hover:border-violet-600/50 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-violet-900/10 active:scale-[0.99]"
        >
          <div className="flex flex-col gap-1">
            <p className="font-semibold group-hover:text-violet-400 transition">
              New Analysis
            </p>
            <p className="text-gray-500 text-sm">Upload resume + paste JD</p>
          </div>
          <span className="text-2xl transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
        <Link
          href="/dashboard/history"
          className="group bg-gray-900/60 border border-gray-800 hover:border-violet-600/50 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-violet-900/10 active:scale-[0.99]"
        >
          <div className="flex flex-col gap-1">
            <p className="font-semibold group-hover:text-violet-400 transition">
              View History
            </p>
            <p className="text-gray-500 text-sm">All past analyses</p>
          </div>
          <span className="text-2xl transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </main>
  );
}