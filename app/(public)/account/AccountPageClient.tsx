"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  Heart,
  Lock,
  Bell,
  Camera,
  CheckCircle2,
  ChevronsUpDown,
  Loader2,
  Save,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Store,
  MapPin,
  ExternalLink,
  Clock,
  ArrowRight,
  BadgeCheck,
  Building2,
  AlertCircle,
  MapPinned,
  FileCheck,
  LogOut,
} from "lucide-react";
import { useSession, logoutFromKeycloak } from "@/lib/auth-client";
import {
  useGetMeQuery,
  useUpdateMeMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  type UserProfile,
} from "@/lib/api/authApi";
import { useGetSellerApplicationQuery } from "@/lib/api/sellerApi";
import AddressBook from "@/components/account/AddressBook";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";
import { cn } from "@/lib/utils";

export default function AccountPageClient() {
  const { data: session, isPending: sessionPending } = useSession();
  const {
    data: profile,
    isLoading: profileLoading,
    refetch,
  } = useGetMeQuery(undefined, {
    skip: !session?.user,
  });

  const { data: sellerApp } = useGetSellerApplicationQuery(undefined, {
    skip: !session?.user,
  });

  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: isDeletingAvatar }] =
    useDeleteAvatarMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<
    "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"
  >("PREFER_NOT_TO_SAY");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");

  const [toast, setToast] = useState<ToastState | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "details"
    | "orders"
    | "saved"
    | "addresses"
    | "security"
    | "notifications"
  >("details");

  // Populate form from API profile or session fallback
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setPhone(profile.phone || "");
      setGender(profile.gender || "PREFER_NOT_TO_SAY");
      setDateOfBirth(profile.dateOfBirth || "");
      setBio(profile.bio || "");
    } else if (session?.user?.name) {
      const parts = session.user.name.trim().split(" ");
      if (parts.length >= 2) {
        setFirstName(parts[0]);
        setLastName(parts.slice(1).join(" "));
      } else {
        setFirstName(session.user.name);
      }
    }
  }, [profile, session]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Derived user display data
  const userEmail = profile?.email || session?.user?.email || "";
  const userFullName =
    profile?.fullName ||
    (firstName || lastName ? `${firstName} ${lastName}`.trim() : "") ||
    session?.user?.name ||
    "User";
  const userAvatarUrl = profile?.avatarUrl || session?.user?.image || "";
  const username = profile?.username || userEmail.split("@")[0] || "user";

  // Keycloak owns email verification — only claim it when the API says so.
  const emailVerified = profile?.emailVerified === true;

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
    : null;

  const isSeller = sellerApp?.status === "APPROVED";
  const isPendingSeller = sellerApp?.status === "PENDING";
  const isRejectedSeller = sellerApp?.status === "REJECTED";

  const storeName = sellerApp?.storeDisplayName || sellerApp?.businessName || `${userFullName}'s Store`;
  const storeLogo = sellerApp?.logoUri || userAvatarUrl;

  function getInitials() {
    if (firstName || lastName) {
      return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
    }
    if (userFullName) {
      const parts = userFullName.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0][0].toUpperCase();
    }
    return "U";
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateMe({
        body: {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
          gender,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio.trim() || undefined,
        },
      }).unwrap();

      setToast({
        type: "success",
        message: "Your profile details have been updated successfully!",
      });
      refetch();
    } catch (err: any) {
      setToast({
        type: "error",
        message:
          err?.data?.message ||
          err?.data?.errorDetails?.[0]?.fieldMessage ||
          "Failed to update profile. Please try again.",
      });
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Image size must be less than 5MB.",
      });
      return;
    }

    try {
      await uploadAvatar({ file }).unwrap();
      setToast({
        type: "success",
        message: "Avatar uploaded successfully!",
      });
      refetch();
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.data?.message || "Failed to upload avatar image.",
      });
    }
  }

  async function handleDeleteAvatar() {
    try {
      await deleteAvatar().unwrap();
      setToast({
        type: "success",
        message: "Avatar removed successfully.",
      });
      refetch();
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.data?.message || "Failed to remove avatar image.",
      });
    }
  }

  function handleCopyUsername() {
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = sessionPending || profileLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-[#6C4CD8]" />
        <p className="mt-4 text-sm font-medium text-[#6B6580]">
          Loading your account details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FB] pb-16 font-sans">
      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-r from-[#1A1330] via-[#2A1D4E] to-[#6C4CD8] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-white/70">
            <Link href="/home" className="transition hover:text-white">
              Home
            </Link>
            <ChevronsUpDown size={14} className="text-white/40" />
            <span className="font-semibold text-white">My Account</span>
          </nav>

          {/* Profile & Store Overview Header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar / Store Logo */}
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {storeLogo ? (
                  <img
                    src={storeLogo}
                    alt={isSeller ? storeName : userFullName}
                    className="h-20 w-20 rounded-2xl border-4 border-white/20 object-cover shadow-xl ring-2 ring-white/10"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white/20 bg-[#6C4CD8] text-2xl font-bold shadow-xl">
                    {getInitials()}
                  </div>
                )}
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#6C4CD8] shadow-md transition hover:scale-110 active:scale-95"
                  title="Change avatar photo"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    {isSeller ? storeName : userFullName}
                  </h1>
                  {isSeller ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur ring-1 ring-emerald-400/30">
                      <BadgeCheck size={15} /> Verified Store
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                      <ShieldCheck size={14} /> Buyer Account
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                  {isSeller && sellerApp?.businessName && (
                    <span className="flex items-center gap-1.5 font-medium text-white/90">
                      <Building2 size={15} className="text-white/60" />{" "}
                      {sellerApp.businessName}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Mail size={15} className="text-white/60" /> {userEmail}
                  </span>
                  {username && (
                    <span className="text-sm text-white/60">@{username}</span>
                  )}
                  {memberSince && (
                    <span className="flex items-center gap-1.5 text-white/70">
                      <Clock size={14} className="text-white/60" /> Member since{" "}
                      {memberSince}
                    </span>
                  )}
                </div>

                {isSeller && sellerApp?.city && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/70">
                    <MapPin size={13} className="text-emerald-400" />
                    <span>
                      {[sellerApp.address, sellerApp.city, sellerApp.province]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Seller / Account Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {isSeller ? (
                <>
                  <Link
                    href="/seller-dashboard/home"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#6C4CD8] shadow-lg transition hover:bg-[#F4F0FF] active:scale-95"
                  >
                    <Store size={18} /> Seller Dashboard
                  </Link>
                  <Link
                    href="/seller-dashboard/products/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
                  >
                    <ShoppingBag size={18} /> Manage Products
                  </Link>
                </>
              ) : isPendingSeller ? (
                <Link
                  href="/account/seller-application"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#1A1330] shadow-lg transition hover:bg-amber-300 active:scale-95"
                >
                  <Clock size={18} /> Store Application Under Review
                </Link>
              ) : (
                <Link
                  href="/account/seller-application"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-3 text-sm font-bold text-[#1A1330] shadow-lg transition hover:brightness-105 active:scale-95"
                >
                  <Store size={18} /> Become a Seller
                </Link>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout Body ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner Callout for Sellers or Applicants */}
        {isSeller && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#6C4CD8] to-[#4F35A5] p-6 text-white shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur shrink-0 text-white">
                  <Store size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white sm:text-xl">
                      {storeName} Dashboard & Operations
                    </h2>
                    <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      Active Store
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/80 sm:text-sm">
                    Manage store listings, view customer orders, process sales, and update store business profile.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/seller-dashboard/home"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#6C4CD8] shadow-sm transition hover:bg-[#F4F0FF]"
                >
                  Open Dashboard <ArrowRight size={14} />
                </Link>
                <Link
                  href="/seller-dashboard/products/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Manage Products
                </Link>
              </div>
            </div>
          </div>
        )}

        {isPendingSeller && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h2 className="text-base font-bold">
                  Seller Registration Submitted — Under Review
                </h2>
                <p className="mt-0.5 text-xs text-amber-800">
                  Your store application for <strong>{storeName}</strong> is being reviewed by the Phsar Digital administration team.
                </p>
              </div>
            </div>

            <Link
              href="/account/seller-application"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-700 shrink-0"
            >
              View Application Status <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {isRejectedSeller && (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 shrink-0">
                <Store size={24} />
              </div>
              <div>
                <h2 className="text-base font-bold">
                  Seller Application Needs Revision
                </h2>
                <p className="mt-0.5 text-xs text-rose-800">
                  {sellerApp?.rejectionNote || "Your application was reviewed and requires updated business details or documents."}
                </p>
              </div>
            </div>

            <Link
              href="/account/seller-application"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 shrink-0"
            >
              Re-apply / Fix Application <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* ── Sidebar Navigation Tabs ── */}
          <div className="space-y-4 lg:col-span-1">
            <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
              {[
                {
                  id: "details",
                  label: "Account Details",
                  icon: User,
                  badge: null,
                },
                {
                  id: "orders",
                  label: "My Orders",
                  icon: ShoppingBag,
                  href: "/orders",
                },
                {
                  id: "saved",
                  label: "Saved Items",
                  icon: Heart,
                  href: "/saved",
                },
                {
                  id: "seller",
                  label: isSeller ? "Seller Dashboard" : "Become a Seller",
                  icon: Store,
                  href: isSeller
                    ? "/seller-dashboard/home"
                    : "/account/seller-application",
                  badge: isSeller
                    ? "Store Active"
                    : isPendingSeller
                      ? "Pending"
                      : isRejectedSeller
                        ? "Rejected"
                        : "New",
                },
                {
                  id: "addresses",
                  label: "Delivery Addresses",
                  icon: MapPinned,
                  badge: null,
                },
                {
                  id: "security",
                  label: "Security & Passwords",
                  icon: Lock,
                  badge: "Protected",
                },
                {
                  id: "notifications",
                  label: "Notifications",
                  icon: Bell,
                  badge: null,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-medium transition",
                        item.id === "seller" && isSeller
                          ? "bg-[#EDE9FB] text-[#6C4CD8] font-bold hover:bg-[#6C4CD8] hover:text-white group"
                          : "text-[#5A5470] hover:bg-[#F8F7FB] hover:text-[#1A1330]"
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Icon size={18} className="shrink-0 text-[#8D86A8] group-hover:text-white" />
                        <span className="truncate text-left">{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide",
                            isSeller
                              ? "bg-[#6C4CD8] text-white group-hover:bg-white group-hover:text-[#6C4CD8]"
                              : "bg-[#F1EFFA] text-[#6C4CD8]"
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronsUpDown size={16} className="shrink-0 text-[#B5B0CA]" />
                      )}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as any)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-[#6C4CD8] text-white shadow-md shadow-[#6C4CD8]/20"
                        : "text-[#5A5470] hover:bg-[#F8F7FB] hover:text-[#1A1330]",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Icon
                        size={18}
                        className={cn("shrink-0", isActive ? "text-white" : "text-[#8D86A8]")}
                      />
                      <span className="truncate text-left">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#F1EFFA] text-[#6C4CD8]",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-[#EAE7F3]">
                <button
                  type="button"
                  onClick={() => logoutFromKeycloak("/")}
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} className="text-rose-600" />
                    <span>Log Out</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Support Callout Card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#EDE9FB] to-[#F5F2FF] p-5 shadow-sm ring-1 ring-[#6C4CD8]/10">
              <div className="flex items-center gap-2 text-[#6C4CD8]">
                <Sparkles size={18} />
                <h3 className="text-base font-bold">Need assistance?</h3>
              </div>
              <p className="mt-2 text-sm text-[#6B6580]">
                Have questions about your Phsar Digital account or order
                inquiries? Our support team is here to help 24/7.
              </p>
              <Link
                href="/contact-us"
                className="mt-4 inline-block text-sm font-semibold text-[#6C4CD8] hover:underline"
              >
                Contact Customer Support →
              </Link>
            </div>
          </div>

          {/* ── Main Content Area ── */}
          <div className="lg:col-span-3">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Form Card */}
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
                  <div className="border-b border-[#EAE7F3] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#1A1330]">
                        Personal Details
                      </h2>
                      <p className="mt-1 text-sm text-[#6B6580]">
                        Update your account profile and contact details used across
                        Phsar Digital.
                      </p>
                    </div>

                    {isSeller && (
                      <Link
                        href="/seller-dashboard/home"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C4CD8] bg-[#EDE9FB] px-3.5 py-2 rounded-xl hover:bg-[#6C4CD8] hover:text-white transition"
                      >
                        <Building2 size={14} /> Go to Seller Dashboard
                      </Link>
                    )}
                  </div>

                  {/* Avatar Upload Banner inside form */}
                  <div className="mt-6 flex flex-col items-start gap-4 rounded-xl border border-[#EDEBF3] bg-[#FAFAFE] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      {userAvatarUrl ? (
                        <img
                          src={userAvatarUrl}
                          alt={userFullName}
                          className="h-16 w-16 rounded-full object-cover ring-2 ring-[#6C4CD8]/30"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6C4CD8] text-xl font-bold text-white">
                          {getInitials()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#1A1330]">
                          Profile Photo
                        </p>
                        <p className="text-sm text-[#8D86A8]">
                          JPG, PNG, or WebP up to 5MB.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="rounded-lg bg-[#EDE9FB] px-4 py-2 text-sm font-semibold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white"
                      >
                        {isUploadingAvatar ? "Uploading..." : "Upload New"}
                      </button>

                      {userAvatarUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteAvatar}
                          disabled={isDeletingAvatar}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                          title="Remove picture"
                        >
                          {isDeletingAvatar ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="mt-8 space-y-6">
                    {/* Section 1: Basic Info */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* First Name */}
                      <div>
                        <label
                          htmlFor="firstName"
                          className="mb-2 block text-sm font-semibold text-[#1A1330]"
                        >
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. John"
                          className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label
                          htmlFor="lastName"
                          className="mb-2 block text-sm font-semibold text-[#1A1330]"
                        >
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Doe"
                          className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
                        />
                      </div>

                      {/* Username (Read-only + Copy) */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#1A1330]">
                          Username
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={username}
                            readOnly
                            className="w-full rounded-xl border border-[#E2DFEC] bg-[#F1EFFA]/60 py-3 pl-4 pr-10 text-sm text-[#5A5470] focus:outline-none cursor-default"
                          />
                          <button
                            type="button"
                            onClick={handleCopyUsername}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D86A8] hover:text-[#6C4CD8]"
                            title="Copy username"
                          >
                            {copied ? (
                              <Check size={18} className="text-emerald-600" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="mb-2 block text-sm font-semibold text-[#1A1330]"
                        >
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0CA]"
                          />
                          <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="012 345 678"
                            className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] py-3 pl-11 pr-4 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label
                          htmlFor="gender"
                          className="mb-2 block text-sm font-semibold text-[#1A1330]"
                        >
                          Gender
                        </label>
                        <select
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] focus:border-[#6C4CD8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
                        >
                          <option value="PREFER_NOT_TO_SAY">
                            Prefer not to say
                          </option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label
                          htmlFor="dateOfBirth"
                          className="mb-2 block text-sm font-semibold text-[#1A1330]"
                        >
                          Date of Birth
                        </label>
                        <div className="relative">
                          <Calendar
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0CA]"
                          />
                          <input
                            id="dateOfBirth"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] py-3 pl-11 pr-4 text-sm text-[#1A1330] focus:border-[#6C4CD8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email Address (Immutable / Verified) */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#1A1330]">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0CA]"
                        />
                        <input
                          type="email"
                          value={userEmail}
                          readOnly
                          className="w-full rounded-xl border border-[#E2DFEC] bg-[#F1EFFA]/60 py-3 pl-11 pr-24 text-sm text-[#5A5470] focus:outline-none cursor-default"
                        />
                        {emailVerified ? (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} /> Verified
                          </span>
                        ) : (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                            <AlertCircle size={14} /> Unverified
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-[#8D86A8]">
                        Email address is managed by Keycloak SSO authentication.
                        {!emailVerified &&
                          " Verify it from the Keycloak security portal under Security & Passwords."}
                      </p>
                    </div>

                    {/* Bio */}
                    <div>
                      <label
                        htmlFor="bio"
                        className="mb-2 block text-sm font-semibold text-[#1A1330]"
                      >
                        Bio / Short Description
                      </label>
                      <textarea
                        id="bio"
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a little bit about yourself..."
                        maxLength={500}
                        className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] p-4 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
                      />
                      <p className="mt-2 text-right text-xs text-[#8D86A8]">
                        {bio.length}/500 characters
                      </p>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-[#EAE7F3] pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          if (profile) {
                            setFirstName(profile.firstName || "");
                            setLastName(profile.lastName || "");
                            setPhone(profile.phone || "");
                            setGender(profile.gender || "PREFER_NOT_TO_SAY");
                            setDateOfBirth(profile.dateOfBirth || "");
                            setBio(profile.bio || "");
                          }
                        }}
                        className="rounded-xl border border-[#E2DFEC] px-6 py-3 text-sm font-semibold text-[#5A5470] transition hover:bg-[#F8F7FB] active:scale-95"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#6C4CD8]/20 transition hover:bg-[#5C3DC8] active:scale-95 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <AddressBook
                defaultRecipient={userFullName}
                defaultPhone={phone}
                onToast={setToast}
              />
            )}

            {activeTab === "security" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
                <h2 className="text-xl font-bold text-[#1A1330]">
                  Security & Password
                </h2>
                <p className="mt-1 text-sm text-[#6B6580]">
                  Your authentication credentials are managed securely through Keycloak SSO.
                </p>

                <div className="mt-6 rounded-xl border border-[#EDEBF3] bg-[#FAFAFE] p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-[#EDE9FB] p-3 text-[#6C4CD8]">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1330]">
                        Keycloak OAuth2 Single Sign-On
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#6B6580]">
                        To update your password, enable multi-factor authentication (MFA), or view active sessions, please visit the Keycloak Account Security Portal.
                      </p>
                      <a
                        href="https://auth.quizzy.it.com/realms/phsardigital/account"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#6C4CD8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5C3DC8]"
                      >
                        Open Keycloak Security Portal →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
                <h2 className="text-xl font-bold text-[#1A1330]">
                  Notification Preferences
                </h2>
                <p className="mt-1 text-sm text-[#6B6580]">
                  Choose how you want to be notified about orders, promotions, and
                  account alerts.
                </p>

                {/* The platform API exposes no notification-preference endpoint
                    yet, so these controls are shown as read-only rather than
                    pretending to save. */}
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      Preferences are not editable yet
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-amber-800">
                      Notification settings are not yet supported by the Phsar
                      Digital API. Until they are, every alert below is sent to
                      <span className="font-semibold">
                        {" " + (userEmail || "your email")}
                      </span>
                      {" "}by default. We will switch these on as soon as the
                      endpoint ships.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    {
                      title: "Order Status Updates",
                      desc: "Sent when your order is confirmed, shipped, or delivered.",
                    },
                    {
                      title: "Promotional Offers & Discounts",
                      desc: "Seasonal sales and exclusive coupon codes.",
                    },
                    {
                      title: "Account Security Alerts",
                      desc: "Important notifications about login attempts.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between gap-4 rounded-xl border border-[#EDEBF3] bg-[#FAFAFE] p-5"
                    >
                      <div>
                        <p className="text-base font-semibold text-[#1A1330]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-[#8D86A8]">{item.desc}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        Always on
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
