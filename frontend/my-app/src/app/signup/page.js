"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  AtSign,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Cpu,
  Globe2,
  Database,
  Bot,
} from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({ fullName: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
      const res = await fetch(`${API_URL}/api/v1/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // short pause so the user can read the success message, then go to login
        setTimeout(() => router.push("/login"), 1400);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
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

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none";
  const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-400";

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
      <div className="absolute -top-40 -right-32 w-[26rem] h-[26rem] sm:w-[34rem] sm:h-[34rem] bg-blue-600/30 rounded-full blur-[110px]" />
      <div className="absolute -bottom-40 -left-32 w-[24rem] h-[24rem] sm:w-[32rem] sm:h-[32rem] bg-indigo-500/30 rounded-full blur-[110px]" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />

      {/* floating node chips (large screens only) */}
      <FloatChip className="hidden xl:flex top-[16%] left-[8%] animate-float-a" icon={<Globe2 size={16} />} tone="bg-amber-500" label="Webhook" />
      <FloatChip className="hidden xl:flex bottom-[18%] left-[12%] animate-float-b" icon={<Database size={16} />} tone="bg-emerald-600" label="Store" />
      <FloatChip className="hidden xl:flex top-[22%] right-[9%] animate-float-b" icon={<Bot size={16} />} tone="bg-blue-600" label="AI Agent" />
      <FloatChip className="hidden xl:flex bottom-[14%] right-[11%] animate-float-a" icon={<Cpu size={16} />} tone="bg-purple-600" label="Router" />

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
            <h1 className="text-3xl sm:text-[2rem] font-black text-white tracking-tight">Create account</h1>
            <p className="mt-2 text-slate-400 text-sm font-medium">
              Join the next generation of <span className="text-blue-400 font-bold">AI building</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div role="alert" className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div role="status" className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span>Registration successful! Taking you to login...</span>
              </div>
            )}

            {/* Full name + username: side by side from sm up, stacked on phones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className={labelClass}>Full name</label>
                <div className="relative group">
                  <User size={18} className={iconClass} />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange("fullName")}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="username" className={labelClass}>Username</label>
                <div className="relative group">
                  <AtSign size={18} className={iconClass} />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    placeholder="johndoe123"
                    value={formData.username}
                    onChange={handleChange("username")}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className={labelClass}>Email address</label>
              <div className="relative group">
                <Mail size={18} className={iconClass} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange("email")}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="relative group">
                <Lock size={18} className={iconClass} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              disabled={loading || success}
              className="group w-full h-12 mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 pt-5 border-t border-white/10 text-center text-slate-400 text-sm font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-bold hover:text-blue-300 underline underline-offset-4 decoration-blue-500/60 decoration-2">
              Sign in
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