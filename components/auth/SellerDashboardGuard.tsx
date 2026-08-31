"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  Lock,
  ShieldAlert,
  Store,
  UserCheck,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useGetMeQuery } from "@/lib/api/authApi";
import {
  useGetSellerApplicationQuery,
  useGetSellerProfileQuery,
} from "@/lib/api/sellerApi";

interface SellerDashboardGuardProps {
  children: React.ReactNode;
}

export function SellerDashboardGuard({ children }: SellerDashboardGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const isLoggedIn = Boolean(session?.user);

  const {
    data: profile,
    isLoading: profileLoading,
  } = useGetMeQuery(undefined, {
    skip: !isLoggedIn,
  });

  const {
    data: sellerApp,
    isLoading: appLoading,
  } = useGetSellerApplicationQuery(undefined, {
    skip: !isLoggedIn,
  });

  const {
    data: sellerProfile,
    isLoading: sellerProfileLoading,
  } = useGetSellerProfileQuery(undefined, {
    skip: !isLoggedIn,
  });

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!sessionPending && !isLoggedIn) {
      const loginUrl = `/auth/login?callbackURL=${encodeURIComponent(pathname || "/seller-dashboard/home")}`;
      router.replace(loginUrl);
    }
  }, [sessionPending, isLoggedIn, pathname, router]);

  // Loading state while verifying session
  if (sessionPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F7FB] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE9FB] shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[#6C4CD8]" />
        </div>
        <h2 className="mt-5 text-lg font-bold text-[#1A1330]">
          Verifying seller credentials...
        </h2>
        <p className="mt-1 text-sm text-[#8B85A0]">
          Please wait while we confirm your account access.
        </p>
      </div>
    );
  }

  // Unauthenticated fallback while redirecting
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F7FB] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm border border-amber-200">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-[#1A1330]">
          Authentication Required
        </h2>
        <p className="mt-2 max-w-sm text-sm text-[#8B85A0]">
          You must be signed in to access the Seller Dashboard. Redirecting to sign in...
        </p>
        <Link
          href={`/auth/login?callbackURL=${encodeURIComponent(pathname || "/seller-dashboard/home")}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#5B3DC0] transition"
        >
          Sign In Now <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // Loading seller authorization status
  const isCheckingAuth =
    profileLoading || (appLoading && sellerProfileLoading);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F7FB] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE9FB] shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[#6C4CD8]" />
        </div>
        <h2 className="mt-5 text-lg font-bold text-[#1A1330]">
          Checking merchant permissions...
        </h2>
        <p className="mt-1 text-sm text-[#8B85A0]">
          Retrieving your store profile and active permissions.
        </p>
      </div>
    );
  }

  // Check seller authorization
  const isSeller = Boolean(
    (profile as any)?.isSeller ||
      sellerApp?.status === "APPROVED" ||
      sellerProfile,
  );

  // If user is an approved seller, grant access
  if (isSeller) {
    return <>{children}</>;
  }

  // Unauthorized State: Pending Seller Application
  if (sellerApp?.status === "PENDING") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7FB] p-4 sm:p-6 font-sans">
        <div className="w-full max-w-lg rounded-3xl border border-[#EDEBF3] bg-white p-8 text-center shadow-[0_8px_32px_rgba(108,76,216,0.08)]">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Clock size={36} />
          </div>

          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
            Application Under Review
          </span>

          <h1 className="mt-3 text-2xl font-black text-[#1A1330]">
            Seller Access Pending
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#6B6580]">
            Your seller registration for{" "}
            <strong className="text-[#1A1330]">
              {sellerApp.businessName || "your store"}
            </strong>{" "}
            has been submitted and is currently being verified by our compliance team.
          </p>

          <div className="mt-6 rounded-2xl bg-[#FAF9FD] border border-[#EDEBF3] p-4 text-left text-xs text-[#6B6580] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1A1330]">Business Name</span>
              <span>{sellerApp.businessName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1A1330]">Status</span>
              <span className="font-bold text-amber-600">Pending Review</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1A1330]">Estimated Time</span>
              <span>1–2 Business Days</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/account/seller-application"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] py-3 text-sm font-bold text-white shadow-md hover:bg-[#5B3DC0] transition"
            >
              <UserCheck size={16} />
              View Application
            </Link>
            <Link
              href="/home"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#EDEBF3] bg-[#F6F5FA] py-3 text-sm font-bold text-[#3F3A52] hover:bg-[#EDEBF3] transition"
            >
              <Home size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized State: Rejected Seller Application
  if (sellerApp?.status === "REJECTED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7FB] p-4 sm:p-6 font-sans">
        <div className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-[0_8px_32px_rgba(244,63,94,0.08)]">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldAlert size={36} />
          </div>

          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-800">
            Action Required
          </span>

          <h1 className="mt-3 text-2xl font-black text-[#1A1330]">
            Seller Application Not Approved
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#6B6580]">
            Your merchant application for{" "}
            <strong className="text-[#1A1330]">
              {sellerApp.businessName || "your store"}
            </strong>{" "}
            requires adjustments or document re-submission.
          </p>

          {sellerApp.rejectionNote && (
            <div className="mt-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 p-4 text-left">
              <p className="text-xs font-bold text-rose-900 uppercase">
                Review Feedback:
              </p>
              <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                {sellerApp.rejectionNote}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/account/seller-application"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] py-3 text-sm font-bold text-white shadow-md hover:bg-[#5B3DC0] transition"
            >
              Review &amp; Reapply <ArrowRight size={16} />
            </Link>
            <Link
              href="/home"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#EDEBF3] bg-[#F6F5FA] py-3 text-sm font-bold text-[#3F3A52] hover:bg-[#EDEBF3] transition"
            >
              <Home size={16} />
              Marketplace Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized State: No Seller Profile / Regular Buyer Account
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7FB] p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg rounded-3xl border border-[#EDEBF3] bg-white p-8 text-center shadow-[0_8px_32px_rgba(108,76,216,0.08)]">
        <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-[#EDE9FB] text-[#6C4CD8] border border-[#DDD8EE]">
          <Store size={36} />
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#EDE9FB] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#6C4CD8]">
          Seller Portal Access
        </span>

        <h1 className="mt-3 text-2xl font-black text-[#1A1330]">
          Seller Authorization Required
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-[#6B6580]">
          You are currently signed in as a buyer account. To access merchant tools, manage products, and view store analytics, please register as an authorized seller on Phsar Digital.
        </p>

        <div className="mt-6 rounded-2xl bg-[#FAF9FD] border border-[#EDEBF3] p-4 text-left text-xs space-y-2.5 text-[#5A5470]">
          <div className="flex items-center gap-2 text-[#1A1330] font-bold">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>List &amp; sell products across Cambodia</span>
          </div>
          <div className="flex items-center gap-2 text-[#1A1330] font-bold">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>Direct KHQR payments &amp; order management</span>
          </div>
          <div className="flex items-center gap-2 text-[#1A1330] font-bold">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>Real-time buyer messaging &amp; store dashboard</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/account/seller-application"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#5B3DC0] transition"
          >
            <Store size={16} />
            Apply to Become a Seller
          </Link>
          <Link
            href="/home"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#EDEBF3] bg-[#F6F5FA] py-3.5 text-sm font-bold text-[#3F3A52] hover:bg-[#EDEBF3] transition"
          >
            <Home size={16} />
            Marketplace Home
          </Link>
        </div>
      </div>
    </div>
  );
}
