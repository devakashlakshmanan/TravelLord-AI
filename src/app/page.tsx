import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      <div className="max-w-3xl mx-auto text-center">
        {/* Corridor Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          NH-766 Kozhikode–Wayanad Life-Safety Corridor
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
          Zero Guesswork. <br className="hidden sm:inline" />
          <span className="text-emerald-700">Deterministic Mountain Safety.</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Traversing the Wayanad ghats requires certainty. TravelLord AI computes a single, verified travel advisory—<span className="font-semibold text-slate-800">Continue, Slow Down, Wait, or Turn Back</span>—with mathematical data integrity.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            id="hero-signup-btn"
            href="/signup"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <span>Plan Safe Transit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            id="hero-login-btn"
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-sm font-semibold border border-slate-200 shadow-sm flex items-center justify-center transition"
          >
            <span>Sign In</span>
          </Link>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Never Fabricates</h3>
            <p className="text-xs text-slate-500 mt-1">If hazard confidence drops below 40%, the system explicitly states INSUFFICIENT_DATA.</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5 font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Deterministic Engine</h3>
            <p className="text-xs text-slate-500 mt-1">100% rule-based backend math. Groq AI is strictly used to phrase natural explanations.</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5 font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Offline Decayed</h3>
            <p className="text-xs text-slate-500 mt-1">Loses confidence in dead zones over time, ensuring you never rely on stale hazard data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
