"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";

export default function RegisterPage() {
  const [fullName,        setFullName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPw,       setConfirmPw]       = useState("");
  const [showPw,          setShowPw]          = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [agreed,          setAgreed]          = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim())            return setError("Full name is required.");
    if (!email.includes("@"))        return setError("Enter a valid email address.");
    if (password.length < 8)         return setError("Password must be at least 8 characters.");
    if (password !== confirmPw)      return setError("Passwords do not match.");
    if (!agreed)                     return setError("Please accept the Terms of Service.");
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800)); // TODO: real API
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* password strength indicator */
  const pwStrength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const pwLabels  = ["", "Weak", "Fair", "Strong"];
  const pwColors  = ["", "bg-red-400", "bg-yellow-400", "bg-emerald-400"];
  const pwTexts   = ["", "text-red-500", "text-yellow-500", "text-emerald-600"];

  const benefitItems = [
    "Free to browse thousands of products",
    "Secure checkout with buyer protection",
    "Track orders in real time",
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F3F8] font-sans">

      {/* ── LEFT panel ── */}
      <AuthLeftPanel
        headline={
          <>
            Your marketplace<br />
            <span className="text-[#C4AFFE]">journey starts here.</span>
          </>
        }
        sub="Join thousands of shoppers on Phsar Digital and access a curated ecosystem of verified vendors."
        extra={
          <ul className="space-y-3">
            {benefitItems.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-[14px] text-white/80">
                <CheckCircle2 size={15} className="flex-shrink-0 text-[#A78BFA]" />
                {b}
              </li>
            ))}
          </ul>
        }
      />

      {/* ── RIGHT: scrollable ── */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-12 sm:px-8">
        <div className="w-full max-w-[460px]">

          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4CD8]">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-base font-bold text-[#1A1330]">Phsar Digital</span>
          </div>

          {success ? (
            /* ── success state ── */
            <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-sm ring-1 ring-black/5">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-[22px] font-bold text-[#1A1330]">Account created!</h2>
              <p className="mt-2 text-[14px] text-[#6B6580]">
                Welcome to Phsar Digital. You can now sign in and start shopping.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-7 py-3 text-[14px] font-semibold text-white hover:bg-[#5C3DC8]"
              >
                Go to Sign In <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            /* ── form card ── */
            <div className="rounded-2xl bg-white px-8 py-9 shadow-sm ring-1 ring-black/5">

              <div className="mb-6">
                <h1 className="text-[26px] font-bold leading-tight text-[#1A1330]">
                  Create your account
                </h1>
                <p className="mt-1.5 text-[14px] text-[#6B6580]">
                  Free forever. No credit card required.
                </p>
              </div>

              {/* buyer notice */}
              <div className="mb-6 flex gap-3 rounded-xl bg-[#F0EDFF] px-4 py-3.5">
                <Info size={16} className="mt-0.5 flex-shrink-0 text-[#6C4CD8]" />
                <div>
                  <p className="text-[13px] font-semibold text-[#3B2A85]">Buyer account</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-[#6B6580]">
                    You&apos;ll be registered as a buyer and can purchase from any vendor instantly.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">

                {/* full name */}
                <Field label="Full Name" htmlFor="fullName">
                  <InputBox
                    id="fullName"
                    icon={<User size={15} className="text-[#B0A8C8]" />}
                    value={fullName}
                    onChange={setFullName}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </Field>

                {/* email */}
                <Field label="Email Address" htmlFor="email">
                  <InputBox
                    id="email"
                    icon={<Mail size={15} className="text-[#B0A8C8]" />}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="john@example.com"
                    autoComplete="email"
                  />
                </Field>

                {/* password */}
                <Field label="Password" htmlFor="password">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0A8C8]" />
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-[#E4DFEF] bg-[#FAFAFE] py-3 pl-10 pr-11 text-[14px] text-[#1A1330] placeholder:text-[#C0B8D0] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
                    />
                    <EyeBtn show={showPw} onToggle={() => setShowPw((s) => !s)} />
                  </div>
                  {/* strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex flex-1 gap-1">
                        {[1, 2, 3].map((n) => (
                          <div
                            key={n}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-all",
                              pwStrength >= n ? pwColors[pwStrength] : "bg-[#EAE7F3]"
                            )}
                          />
                        ))}
                      </div>
                      <span className={cn("text-[11px] font-semibold", pwTexts[pwStrength])}>
                        {pwLabels[pwStrength]}
                      </span>
                    </div>
                  )}
                </Field>

                {/* confirm password */}
                <Field label="Confirm Password" htmlFor="confirmPw">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0A8C8]" />
                    <input
                      id="confirmPw"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={cn(
                        "w-full rounded-xl border bg-[#FAFAFE] py-3 pl-10 pr-11 text-[14px] text-[#1A1330] placeholder:text-[#C0B8D0] focus:outline-none focus:ring-2",
                        confirmPw && password !== confirmPw
                          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                          : "border-[#E4DFEF] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15"
                      )}
                    />
                    <EyeBtn show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />
                    {confirmPw && password === confirmPw && (
                      <CheckCircle2 size={15} className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                </Field>

                {/* terms */}
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#6C4CD8]"
                  />
                  <span className="text-[13px] leading-relaxed text-[#5A5470]">
                    I agree to the{" "}
                    <Link href="/terms" className="font-semibold text-[#6C4CD8] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-semibold text-[#6C4CD8] hover:underline">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                    {error}
                  </p>
                )}

                {/* submit */}
                <button
                  type="submit"
                  disabled={!agreed || submitting}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold text-white transition-all",
                    !agreed || submitting
                      ? "cursor-not-allowed bg-[#C7C2D6]"
                      : "bg-[#6C4CD8] hover:bg-[#5C3DC8] active:scale-[0.98]"
                  )}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account…
                    </span>
                  ) : (
                    <>Create Account <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              {/* sign in link */}
              <div className="mt-6 rounded-xl border border-dashed border-[#DDD8EE] px-5 py-5 text-center">
                <p className="mb-3 text-[13px] text-[#6B6580]">
                  Already have an account?
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#EDE9FB] px-6 py-2.5 text-[13px] font-semibold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white"
                >
                  Sign in instead <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

          <p className="mt-5 text-center text-[11px] leading-relaxed text-[#A09AB8]">
            Protected by reCAPTCHA &mdash;{" "}
            <Link href="/privacy" className="font-medium text-[#6C4CD8] hover:underline">Privacy</Link>
            {" & "}
            <Link href="/terms" className="font-medium text-[#6C4CD8] hover:underline">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── small helpers ────────────────────────────────────────────── */

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-[#1A1330]">
        {label}
      </label>
      {children}
    </div>
  );
}

function InputBox({
  id, icon, type = "text", value, onChange, placeholder, autoComplete,
}: {
  id: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-[#E4DFEF] bg-[#FAFAFE] py-3 pl-10 pr-4 text-[14px] text-[#1A1330] placeholder:text-[#C0B8D0] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
      />
    </div>
  );
}

function EyeBtn({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0A8C8] hover:text-[#6C4CD8]"
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}
