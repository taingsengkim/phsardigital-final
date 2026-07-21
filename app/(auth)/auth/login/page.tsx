// app/(auth)/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Page() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) return setError("Please enter your email/username and password.");

    setSubmitting(true);
    try {
      // TODO: replace with your actual login call
      await new Promise((r) => setTimeout(r, 600));
    } catch {
      setError("Invalid email/username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen text-[17px]">
      {/* ============ LEFT PANEL ============ */}
      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1E1150] via-[#3B1F8A] to-[#5B33B8] px-14 py-12 lg:flex lg:basis-1/2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="2" width="3" height="3" rx="0.7" fill="white" opacity="0.85" />
              <rect x="1" y="7" width="3" height="3" rx="0.7" fill="white" opacity="0.85" />
              <rect x="6" y="7" width="3" height="3" rx="0.7" fill="white" opacity="0.85" />
              <path d="M6 2h6a4 4 0 0 1 0 8h-3v6h-3V2z" fill="white" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">Phsar Digital</span>
        </div>

        <div>
          <h1 className="text-[42px] font-extrabold leading-tight text-white">
            Unified Commerce
            <br />
            for Modern Markets
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/75">
            Access your merchant dashboard, track inventory, and connect with millions of shoppers across the
            ecosystem.
          </p>
        </div>

        <div className="flex gap-10 rounded-xl bg-white/10 px-8 py-6">
          <div>
            <p className="text-sm font-medium text-white/70">Active Vendors</p>
            <p className="mt-1 text-2xl font-bold text-white">12,400+</p>
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">Secure Transactions</p>
            <p className="mt-1 text-2xl font-bold text-white">99.9%</p>
          </div>
        </div>
      </div>

      {/* ============ RIGHT PANEL ============ */}
      <div className="flex flex-1 items-center justify-center bg-[#F5F3F7] px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[460px] rounded-2xl bg-white px-10 py-10 shadow-[0_1px_3px_rgba(26,19,48,0.08)]"
        >
          <h2 className="mb-1.5 text-[28px] font-bold text-[#1A1330]">Welcome Back</h2>
          <p className="mb-6 text-[16px] text-[#6B6580]">Enter your credentials to manage your account.</p>

          <label htmlFor="identifier" className="mb-1.5 block text-[15px] font-semibold text-[#1A1330]">
            Email or Username
          </label>
          <div className="relative mb-5">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7A2B8]" />
            <input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@company.com"
              autoComplete="username"
              className="w-full rounded-[9px] border border-[#E2DFEC] bg-[#FAFAFC] py-3.5 pl-11 pr-3.5 text-base text-[#1A1330] outline-none focus:border-[#4C2E9E] focus:ring-2 focus:ring-[#4C2E9E]/15"
            />
          </div>

          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-[15px] font-semibold text-[#1A1330]">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-sm font-semibold text-[#6C4CD8] hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative mb-6">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7A2B8]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-[9px] border border-[#E2DFEC] bg-[#FAFAFC] py-3.5 pl-11 pr-11 text-base text-[#1A1330] outline-none focus:border-[#4C2E9E] focus:ring-2 focus:ring-[#4C2E9E]/15"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A7A2B8] hover:text-[#6B6580]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-[10px] py-[15px] text-base font-semibold text-white transition-colors",
              submitting ? "cursor-not-allowed bg-[#C7C2D6]" : "bg-[#2E1A66] hover:bg-[#2E1A66]/90"
            )}
          >
            {submitting ? "Signing in…" : "Sign In"}
            {!submitting && <ArrowRight size={17} />}
          </button>

          {/* social login — inline SVG brand marks instead of lucide-react,
              since lucide is a generic icon set and doesn't ship brand logos */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              type="button"
              aria-label="Continue with Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E2DFEC] bg-black text-white hover:opacity-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" />
                <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Continue with Google"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E2DFEC] text-[17px] font-bold text-[#EA4335] hover:bg-[#FAFAFC]"
            >
              G
            </button>
            <button
              type="button"
              aria-label="Continue with Facebook"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E2DFEC] text-[17px] font-bold text-[#1877F2] hover:bg-[#FAFAFC]"
            >
              f
            </button>
          </div>

          <div className="my-6 flex items-center gap-3.5">
            <div className="h-px flex-1 bg-[#E5E2EC]" />
            <span className="text-[13px] text-[#A7A2B8]">Or</span>
            <div className="h-px flex-1 bg-[#E5E2EC]" />
          </div>

          <div className="rounded-[10px] border border-dashed border-[#D9D4E8] px-5 py-5 text-center">
            <p className="mb-3.5 text-base text-[#3F3A52]">New to Phsar Digital?</p>
            <Link
              href="/auth/register"
              className="inline-block rounded-lg bg-[#8267E8] px-8 py-2.5 text-[15px] font-semibold text-white hover:bg-[#8267E8]/90"
            >
              Register Now
            </Link>
          </div>

          <p className="mt-5 text-center text-[13px] leading-relaxed text-[#8B85A0]">
            By continuing, you agree to Phsar Digitals{" "}
            <Link href="/terms" className="text-[#6C4CD8] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#6C4CD8] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}