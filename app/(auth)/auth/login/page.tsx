"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function handleKeycloakLogin() {
    setLoading(true);
    try {
      await signIn("keycloak", { callbackUrl: "/" });
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to redirect to sign-in. Please try again.",
      });
      setLoading(false);
    }
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
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#f4f3f8_50%,_#efeafc_100%)] font-sans">
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

      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-12 sm:px-8">
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

          <div className="animate-[fadeIn_0.35s_ease-out] rounded-2xl bg-white px-8 py-10 shadow-[0_20px_60px_rgba(108,76,216,0.12)] ring-1 ring-black/5">
            {/* heading */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE9FB]">
                <Shield size={28} className="text-[#6C4CD8]" />
              </div>
              <h1 className="text-[26px] font-bold leading-tight text-[#1A1330]">
                Welcome back 👋
              </h1>
              <p className="mt-2 text-[14px] text-[#6B6580]">
                Sign in securely via your Phsar Digital account.
              </p>
            </div>

            {/* Keycloak SSO button */}
            <button
              id="keycloak-login-btn"
              type="button"
              onClick={handleKeycloakLogin}
              disabled={loading}
              className={cn(
                "flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-[15px] font-semibold text-white transition-all shadow-[0_10px_24px_rgba(108,76,216,0.25)]",
                loading
                  ? "cursor-not-allowed bg-[#C7C2D6]"
                  : "bg-[#6C4CD8] hover:bg-[#5C3DC8] active:scale-[0.98]",
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Redirecting…
                </span>
              ) : (
                <>
                  <KeycloakIcon />
                  Sign in with Keycloak
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* info note */}
            <p className="mt-5 text-center text-[12px] leading-relaxed text-[#9B94B4]">
              You&apos;ll be securely redirected to{" "}
              <span className="font-semibold text-[#6C4CD8]">
                auth.quizzy.it.com
              </span>{" "}
              to complete sign-in.
            </p>

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

function KeycloakIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        d="M8.5 8L12 12l-3.5 4H6l3.5-4L6 8h2.5zM13.5 8L17 12l-3.5 4H11l3.5-4L11 8h2.5z"
        fill="white"
      />
    </svg>
  );
}

