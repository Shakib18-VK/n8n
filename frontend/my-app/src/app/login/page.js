"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  AlertCircle,
  Loader2,
  Cpu,
  Globe2,
  Database,
  Bot,
} from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      login(data);
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // text-base on phones stops iOS from zooming in on focus
  const inputClass =
    "w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 text-white rounded-xl text-base sm:text-sm font-medium " +
    "placeholder:text-slate-500 outline-none transition-all " +
    "focus:bg-white/10 focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/20";

  return (
    // 3.5rem = navbar height
    <div className="relative min-h-[calc(100dvh-3.5rem)] flex items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 font-sans">

      {/* ---------- BACKGROUND ---------- */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div className="absolute -top-40 -left-32 w-[26rem] h-[26rem] sm:w-[34rem] sm:h-[34rem] bg-blue-600/30 rounded-full blur-[110px]" />
      <div className="absolute -bottom-40 -right-32 w-[24rem] h-[24rem] sm:w-[32rem] sm:h-[32rem] bg-indigo-500/30 rounded-full blur-[110px]" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />

      {/* floating node chips (large screens only, so they never crowd the card) */}
      <FloatChip className="hidden lg:flex top-[18%] left-[10%] animate-float-a" icon={<Globe2 size={16} />} tone="bg-amber-500" label="Webhook" />
      <FloatChip className="hidden lg:flex bottom-[20%] left-[14%] animate-float-b" icon={<Database size={16} />} tone="bg-emerald-600" label="Store" />
      <FloatChip className="hidden lg:flex top-[24%] right-[11%] animate-float-b" icon={<Bot size={16} />} tone="bg-blue-600" label="AI Agent" />
      <FloatChip className="hidden lg:flex bottom-[16%] right-[13%] animate-float-a" icon={<Cpu size={16} />} tone="bg-purple-600" label="Router" />

      {/* ---------- CARD ---------- */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[1.75rem] sm:rounded-[2rem] bg-white/[0.06] backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 p-6 sm:p-9">

          {/* header */}
          <div className="text-center mb-7 sm:mb-8">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-2xl bg-blue-500 blur-xl opacity-50" />
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-xl">
                <Zap size={26} className="text-white fill-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-[2rem] font-black text-white tracking-tight">Welcome back</h1>
            <p className="mt-2 text-slate-400 text-sm font-medium">
              Sign in to continue building your <span className="text-blue-400 font-bold">AI workflows</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div role="alert" className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-400">Username</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  placeholder="johndoe_ai"
                  value={formData.username}
                  onChange={handleChange("username")}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">Email address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange("email")}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                <Link href="#" className="text-xs font-bold text-blue-400 hover:text-blue-300">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange("password")}
                  className={`${inputClass} pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 pt-5 border-t border-white/10 text-center text-slate-400 text-sm font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white font-bold hover:text-blue-300 underline underline-offset-4 decoration-blue-500/60 decoration-2">
              Create free account
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-a { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes float-b { 0%,100% { transform: translateY(0); } 50% { transform: translateY(12px); } }
        .animate-float-a { animation: float-a 6s ease-in-out infinite; }
        .animate-float-b { animation: float-b 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-float-a, .animate-float-b { animation: none; }
        }
      `}</style>
    </div>
  );
}

// --- decorative floating node chip ---
function FloatChip({ className = "", icon, tone, label }) {
  return (
    <div
      className={`absolute items-center gap-2.5 pl-2 pr-4 py-2 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 shadow-xl ${className}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${tone}`}>{icon}</div>
      <span className="text-xs font-bold text-slate-300">{label}</span>
    </div>
  );
}