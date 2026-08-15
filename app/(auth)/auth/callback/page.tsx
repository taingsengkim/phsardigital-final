"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const KC_ISSUER = "https://auth.quizzy.it.com/realms/phsardigital";
const KC_CLIENT = "phsardigital-client";
const KC_SECRET = "idh56ELtGEuuUVGVSeIWoRw2F8Ul5H5M";

function CallbackContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [status,  setStatus]  = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    const code  = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    /* Keycloak returned an error (user cancelled etc.) */
    if (error) {
      setStatus("error");
      setMessage(searchParams.get("error_description") ?? "Login was cancelled.");
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    if (!code) {
      router.replace("/auth/login");
      return;
    }

    /* CSRF check */
    const savedState = sessionStorage.getItem("kc_state");
    if (savedState && state && state !== savedState) {
      setStatus("error");
      setMessage("Security check failed. Please try again.");
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    async function exchange() {
      try {
        const callbackUri = `${window.location.origin}/auth/callback`;
        const body = new URLSearchParams({
          grant_type:    "authorization_code",
          client_id:     KC_CLIENT,
          client_secret: KC_SECRET,
          redirect_uri:  callbackUri,
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
          throw new Error(d?.error_description ?? `Token exchange failed (${res.status})`);
        }

        const tokens = await res.json();

        /* store tokens — clientFetch + SavedButton + AddToCartButton all read these */
        sessionStorage.setItem("kc_access_token",  tokens.access_token);
        sessionStorage.setItem("kc_refresh_token", tokens.refresh_token ?? "");
        sessionStorage.setItem("kc_expires_at",
          String(Date.now() + tokens.expires_in * 1000));
        sessionStorage.removeItem("kc_state");

        setStatus("success");
        setMessage("Signed in! Taking you back…");

        /* return to the page user was on, or home */
        const returnTo = sessionStorage.getItem("kc_return_to") ?? "/home";
        sessionStorage.removeItem("kc_return_to");
        router.replace(returnTo);

      } catch (err: unknown) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Login failed. Redirecting…");
        setTimeout(() => router.replace("/auth/login"), 3000);
      }
    }

    exchange();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F3F8]">
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-white px-12 py-14 text-center shadow-sm ring-1 ring-black/5">

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

        <div>
          <p className="text-[17px] font-bold text-[#1A1330]">{message}</p>
          <p className="mt-1.5 text-[13px] text-[#8B85A0]">
            {status === "loading" && "Exchanging credentials securely…"}
            {status === "success" && "You are now signed in."}
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
      <CallbackContent />
    </Suspense>
  );
}
