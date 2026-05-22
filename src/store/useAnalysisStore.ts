import { create } from "zustand";

interface Skills {
    highlight: string[];
    learn: string[];
}

interface AnalysisResult {
    score: number;
    rewrittenBullets: string;
    coverLetter: string;
    skills: Skills;
}

interface AnalysisStep {
    label: string;
    done: boolean;
    active: boolean;
}

interface AnalysisStore {
    // Results
    result: AnalysisResult | null;
    setResult: (result: AnalysisResult) => void;
    clearResult: () => void;

    // Loading state
    isAnalyzing: boolean;
    setIsAnalyzing: (val: boolean) => void;

    // Progress steps
    steps: AnalysisStep[];
    setStepActive: (index: number) => void;
    setStepDone: (index: number) => void;
    resetSteps: () => void;

    // Error
    error: string;
    setError: (err: string) => void;
}

const defaultSteps: AnalysisStep[] = [
    { label: "📄 Extracting resume text", done: false, active: false },
    { label: "🎯 Scoring your match", done: false, active: false },
    { label: "✍️ Rewriting bullet points", done: false, active: false },
    { label: "📝 Generating cover letter", done: false, active: false },
    { label: "💡 Finding skill gaps", done: false, active: false },
];

export const useAnalysisStore = create<AnalysisStore>((set) => ({
    result: null,
    setResult: (result) => set({ result }),
    clearResult: () => set({ result: null }),

    isAnalyzing: false,
    setIsAnalyzing: (val) => set({ isAnalyzing: val }),

    error: "",
    setError: (err) => set({ error: err }),

    steps: defaultSteps.map((s) => ({ ...s })),

    setStepActive: (index) =>
        set((state) => ({
            steps: state.steps.map((s, i) =>
                i === index ? { ...s, active: true } : s
            ),
        })),

    setStepDone: (index) =>
        set((state) => ({
            steps: state.steps.map((s, i) =>
                i === index ? { ...s, done: true, active: false } : s
            ),
        })),

    resetSteps: () =>
        set({
            steps: defaultSteps.map((s) => ({ ...s })),
        }),
}));