"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const KC_ISSUER = "https://auth.quizzy.it.com/realms/phsardigital";
const KC_CLIENT = "phsardigital-client";
const KC_SECRET = "idh56ELtGEuuUVGVSeIWoRw2F8Ul5H5M";

function getCallbackUri() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}

function CallbackInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    const code  = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    /* Keycloak returned an error (user cancelled, etc.) */
    if (error) {
      setStatus("error");
      setMessage(
        searchParams.get("error_description") ??
          "Login was cancelled. Redirecting…"
      );
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    if (!code) {
      router.replace("/auth/login");
      return;
    }

    /* Verify state to prevent CSRF */
    const savedState = sessionStorage.getItem("kc_state");
    if (savedState && state && state !== savedState) {
      setStatus("error");
      setMessage("Security check failed. Please try again.");
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    async function exchangeCode() {
      try {
        const body = new URLSearchParams({
          grant_type:    "authorization_code",
          client_id:     KC_CLIENT,
          client_secret: KC_SECRET,
          redirect_uri:  getCallbackUri(),
          code:          code!,
        });

        const res = await fetch(
          `${KC_ISSUER}/protocol/openid-connect/token`,
          {
            method:  "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body:    body.toString(),
          }
        );

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d?.error_description ?? "Token exchange failed");
        }

        const tokens = await res.json();

        /* persist tokens */
        sessionStorage.setItem("kc_access_token",  tokens.access_token);
        sessionStorage.setItem("kc_refresh_token", tokens.refresh_token ?? "");
        sessionStorage.setItem("kc_expires_at",
          String(Date.now() + tokens.expires_in * 1000));

        /* clean up */
        sessionStorage.removeItem("kc_state");

        setStatus("success");
        setMessage("Signed in successfully!");
        router.replace("/home");

      } catch (err: unknown) {
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Login failed. Redirecting…"
        );
        setTimeout(() => router.replace("/auth/login"), 3000);
      }
    }

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F3F8]">
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-white px-12 py-14 shadow-sm ring-1 ring-black/5">

        {/* icon */}
        {status === "loading" && (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0EDFB]">
            <Loader2 size={32} className="animate-spin text-[#6C4CD8]" />
          </div>
        )}
        {status === "success" && (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
        )}
        {status === "error" && (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle size={32} className="text-red-500" />
          </div>
        )}

        {/* text */}
        <div className="text-center">
          <p className="text-[17px] font-bold text-[#1A1330]">{message}</p>
          <p className="mt-1.5 text-[13px] text-[#8B85A0]">
            {status === "loading" && "Securely exchanging credentials…"}
            {status === "success" && "Taking you to the marketplace…"}
            {status === "error"   && "You will be redirected shortly."}
          </p>
        </div>

      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F4F3F8]">
        <Loader2 size={28} className="animate-spin text-[#6C4CD8]" />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
