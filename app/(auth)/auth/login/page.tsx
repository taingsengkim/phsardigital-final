"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";

const KC_ISSUER  = "https://auth.quizzy.it.com/realms/phsardigital";
const KC_CLIENT  = "phsardigital-client";
const KC_SECRET  = "idh56ELtGEuuUVGVSeIWoRw2F8Ul5H5M";
const CALLBACK   = typeof window !== "undefined"
  ? `${window.location.origin}/auth/callback`
  : "http://localhost:3000/auth/callback";

function startLogin() {
  const state = crypto.randomUUID();
  sessionStorage.setItem("kc_state", state);
  const params = new URLSearchParams({
    client_id:     KC_CLIENT,
    redirect_uri:  typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "http://localhost:3000/auth/callback",
    response_type: "code",
    scope:         "openid email profile",
    state,
  });
  window.location.assign(`${KC_ISSUER}/protocol/openid-connect/auth?${params}`);
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  /* redirect if already logged in */
  useEffect(() => {
    const token = sessionStorage.getItem("kc_access_token");
    const exp   = Number(sessionStorage.getItem("kc_expires_at") ?? "0");
    if (token && Date.now() < exp) {
      window.location.replace("/home");
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setToast(null);

    if (!identifier.trim() || !password) {
      return setError("Please enter your email/username and password.");
    }

    setSubmitting(true);
    setToast({ type: "success", message: "Redirecting to secure sign-in…" });
    // small delay so toast is visible before redirect
    setTimeout(() => startLogin(), 600);
  }

  const statsBlock = (
    <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/10 px-6 py-5">
      {[
        { label: "Active Vendors", value: "12,400+" },
        { label: "Secure Transactions", value: "99.9%" },
      ].map(({ label, value }) => (
        <div key={label}>
          <p className="text-[12px] font-medium text-white/60">{label}</p>
          <p className="mt-0.5 text-[22px] font-bold text-white">{value}</p>
        </div>
      ))}
    </div>
  );

  return (
    /* full-viewport flex row — left panel is sticky, right scrolls */
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#f4f3f8_50%,_#efeafc_100%)] font-sans">
      {/* ── LEFT: fixed brand panel ── */}
      <AuthLeftPanel
        headline={
          <>
            Unified Commerce
            <br />
            <span className="text-[#C4AFFE]">for Modern Markets</span>
          </>
        }
        sub="Manage your account, track orders, and connect with thousands of vendors across the Phsar Digital ecosystem."
        extra={statsBlock}
      />

      {/* ── RIGHT: scrollable form panel ── */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-12 sm:px-8">
        <div className="w-full max-w-[440px]">
          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4CD8]">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-base font-bold text-[#1A1330]">
              Phsar Digital
            </span>
          </div>

          {/* card */}
          <div className="animate-[fadeIn_0.35s_ease-out] rounded-2xl bg-white px-8 py-9 shadow-[0_20px_60px_rgba(108,76,216,0.12)] ring-1 ring-black/5">
            {/* heading */}
            <div className="mb-7">
              <h1 className="text-[26px] font-bold leading-tight text-[#1A1330]">
                Welcome back 👋
              </h1>
              <p className="mt-1.5 text-[14px] text-[#6B6580]">
                Sign in to your Phsar Digital account.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* email / username */}
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-1.5 block text-[13px] font-semibold text-[#1A1330]"
                >
                  Email or Username
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0A8C8]"
                  />
                  <input
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="username"
                    className="w-full rounded-xl border border-[#E4DFEF] bg-[#FAFAFE] py-3 pl-10 pr-4 text-[14px] text-[#1A1330] placeholder:text-[#C0B8D0] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-semibold text-[#1A1330]"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[12px] font-semibold text-[#6C4CD8] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0A8C8]"
                  />
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#E4DFEF] bg-[#FAFAFE] py-3 pl-10 pr-11 text-[14px] text-[#1A1330] placeholder:text-[#C0B8D0] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
                  />
                  <button
                    type="button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0A8C8] hover:text-[#6C4CD8]"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-600">
                  {error}
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold text-white transition-all shadow-[0_10px_24px_rgba(108,76,216,0.2)]",
                  submitting
                    ? "cursor-not-allowed bg-[#C7C2D6]"
                    : "bg-[#6C4CD8] hover:bg-[#5C3DC8] active:scale-[0.98]",
                )}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </span>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#EAE7F3]" />
              <span className="text-[12px] font-medium text-[#B0A8C8]">
                or continue with
              </span>
              <div className="h-px flex-1 bg-[#EAE7F3]" />
            </div>

            {/* social */}
            <div className="flex justify-center gap-3">
              {/* Google */}
              <SocialBtn aria-label="Continue with Google">
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                  />
                  <path
                    fill="#34A853"
                    d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
                  />
                </svg>
              </SocialBtn>

              {/* Facebook */}
              <SocialBtn aria-label="Continue with Facebook">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2">
                  <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
                </svg>
              </SocialBtn>

              {/* Instagram */}
              <SocialBtn
                aria-label="Continue with Instagram"
                className="bg-black"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
                </svg>
              </SocialBtn>
            </div>

            {/* register link */}
            <div className="mt-7 rounded-xl border border-dashed border-[#DDD8EE] bg-[#FCFBFF] px-5 py-5 text-center">
              <p className="mb-3 text-[13px] text-[#6B6580]">
                Don&apos;t have an account yet?
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#EDE9FB] px-6 py-2.5 text-[13px] font-semibold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white"
              >
                Create an account <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* footer note */}
          <p className="mt-5 text-center text-[11px] leading-relaxed text-[#A09AB8]">
            By signing in you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-[#6C4CD8] hover:underline"
            >
              Terms
            </Link>
            {" & "}
            <Link
              href="/privacy"
              className="font-medium text-[#6C4CD8] hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <AuthToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function SocialBtn({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl border border-[#E4DFEF] bg-white transition hover:border-[#6C4CD8]/40 hover:shadow-sm active:scale-95",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
