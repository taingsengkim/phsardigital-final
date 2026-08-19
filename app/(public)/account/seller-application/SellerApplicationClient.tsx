"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Globe,
  Loader2,
  ChevronsUpDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Info,
  ExternalLink,
  Clock,
  Briefcase,
  IdCard,
  Building,
  Check,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useGetMeQuery } from "@/lib/api/authApi";
import {
  useGetSellerApplicationQuery,
  useCreateSellerApplicationMutation,
  useUploadLogoFileMutation,
  useUploadDocumentFileMutation,
  useAttachDocumentMutation,
  type DocumentType,
  type SellerApplication,
} from "@/lib/api/sellerApi";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";
import { cn } from "@/lib/utils";

export default function SellerApplicationClient() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: profile, isLoading: profileLoading } = useGetMeQuery(undefined, {
    skip: !session?.user,
  });

  const {
    data: sellerApp,
    isLoading: appLoading,
    refetch: refetchApp,
  } = useGetSellerApplicationQuery(undefined, {
    skip: !session?.user,
  });

  const [createApplication, { isLoading: isCreating }] =
    useCreateSellerApplicationMutation();
  const [uploadLogoFile, { isLoading: isUploadingLogo }] = useUploadLogoFileMutation();
  const [uploadDocumentFile, { isLoading: isUploadingDoc }] = useUploadDocumentFileMutation();
  const [attachDocument] = useAttachDocumentMutation();

  // Wizard Step: 1 = Business Details, 2 = Document Upload, 3 = Waiting for Approval
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reapplying, setReapplying] = useState(false);

  // Form State - Step 1: Business Information
  const [businessName, setBusinessName] = useState("");
  const [storeDisplayName, setStoreDisplayName] = useState("");
  const [businessType, setBusinessType] = useState<
    "INDIVIDUAL" | "SOLE_PROPRIETORSHIP" | "PARTNERSHIP" | "COMPANY"
  >("INDIVIDUAL");
  const [description, setDescription] = useState("");
  const [logoObjectName, setLogoObjectName] = useState("");
  const [logoUri, setLogoUri] = useState("");

  // Form State - Location Details
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Logo & Document Upload States
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingDocType, setUploadingDocType] = useState<DocumentType | null>(null);
  const [localDocs, setLocalDocs] = useState<Record<string, { fileName: string; uri?: string }>>({});

  const logoInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  // Errors & Toast
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [nonFieldError, setNonFieldError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Track initial sync so refetchApp doesn't override manual step transitions
  const [initialSynced, setInitialSynced] = useState(false);

  // Sync state from existing application
  useEffect(() => {
    if (sellerApp && sellerApp.status !== "NOT_FOUND" && !reapplying) {
      setBusinessName((prev) => prev || sellerApp.businessName || "");
      setStoreDisplayName((prev) => prev || sellerApp.storeDisplayName || sellerApp.businessName || "");
      setBusinessType((prev) => prev || sellerApp.businessType || "INDIVIDUAL");
      setDescription((prev) => prev || sellerApp.description || "");
      setLogoUri((prev) => prev || sellerApp.logoUri || "");
      setAddress((prev) => prev || sellerApp.address || "");
      setCity((prev) => prev || sellerApp.city || "");
      setProvince((prev) => prev || sellerApp.province || "");
      setGoogleMapsUrl((prev) => prev || sellerApp.googleMapsUrl || "");
      setLatitude((prev) => prev || (sellerApp.latitude !== undefined ? String(sellerApp.latitude) : ""));
      setLongitude((prev) => prev || (sellerApp.longitude !== undefined ? String(sellerApp.longitude) : ""));

      // Only auto-jump to Step 3 on INITIAL page load if application is already pending
      if (!initialSynced && sellerApp.status === "PENDING") {
        setStep(3);
        setInitialSynced(true);
      }
    }
  }, [sellerApp, reapplying, initialSynced]);

  // Validate Step 1 Form
  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    setNonFieldError(null);

    if (!businessName.trim()) {
      errors.businessName = "Shop / Business name is required.";
    } else if (businessName.trim().length > 100) {
      errors.businessName = "Business name cannot exceed 100 characters.";
    }

    if (storeDisplayName && storeDisplayName.trim().length > 100) {
      errors.storeDisplayName = "Store display name cannot exceed 100 characters.";
    }

    if (description && description.length > 500) {
      errors.description = "Description cannot exceed 500 characters.";
    }

    if (address && address.length > 200) {
      errors.address = "Address cannot exceed 200 characters.";
    }

    if (city && city.length > 100) {
      errors.city = "City name cannot exceed 100 characters.";
    }

    if (province && province.length > 100) {
      errors.province = "Province cannot exceed 100 characters.";
    }

    if (googleMapsUrl && googleMapsUrl.trim()) {
      const url = googleMapsUrl.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        errors.googleMapsUrl = "Google Maps URL must start with http:// or https://";
      }
    }

    if (latitude.trim()) {
      const latNum = parseFloat(latitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        errors.latitude = "Latitude must be between -90 and 90.";
      }
    }

    if (longitude.trim()) {
      const lngNum = parseFloat(longitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        errors.longitude = "Longitude must be between -180 and 180.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Parse Latitude and Longitude from Google Maps URL across all Google Maps formats
  function parseGoogleMapsUrl(url: string) {
    if (!url) return null;

    // Pattern 1: !3d11.5563768!4d104.9282123 (Google Maps Place data URLs)
    const dataMatch = url.match(/!3d(-?\d+(?:\.\d+)?)[^\d!]*!4d(-?\d+(?:\.\d+)?)/i);
    if (dataMatch) {
      const lat = parseFloat(dataMatch[1]);
      const lng = parseFloat(dataMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    // Pattern 2: @11.5563768,104.9282123 (Standard viewport URLs)
    const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    // Pattern 3: ?q=11.5563768,104.9282123 or &ll=11.5563768,104.9282123
    const paramMatch = url.match(/[?&](?:q|ll|center|point|destination|origin)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
    if (paramMatch) {
      const lat = parseFloat(paramMatch[1]);
      const lng = parseFloat(paramMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    // Pattern 4: /dir//11.5563768,104.9282123 or /search/11.5563768,104.9282123
    const searchMatch = url.match(/(?:search|dir|place)\/(-?\d+(?:\.\d+)?),(?:\+|\s)?(-?\d+(?:\.\d+)?)/i);
    if (searchMatch) {
      const lat = parseFloat(searchMatch[1]);
      const lng = parseFloat(searchMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    // Pattern 5: Plain numbers or coordinates "11.5563768, 104.9282123"
    const plainMatch = url.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    if (plainMatch) {
      const lat = parseFloat(plainMatch[1]);
      const lng = parseFloat(plainMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    return null;
  }

  // Auto extract lat/long on Google Maps URL input change
  async function handleGoogleMapsUrlChange(urlValue: string) {
    setGoogleMapsUrl(urlValue);
    if (fieldErrors.googleMapsUrl) {
      setFieldErrors((prev) => ({ ...prev, googleMapsUrl: "" }));
    }

    if (!urlValue.trim()) return;

    // 1. Try parsing standard Google Maps URL
    const coords = parseGoogleMapsUrl(urlValue);
    if (coords) {
      setLatitude(String(coords.lat));
      setLongitude(String(coords.lng));
      setToast({
        type: "success",
        message: `Auto-extracted coordinates: ${coords.lat}, ${coords.lng}`,
      });
      return;
    }

    // 2. If URL is a shortened link (maps.app.goo.gl or goo.gl/maps), resolve full URL asynchronously
    if (urlValue.includes("goo.gl") || urlValue.includes("maps.app")) {
      try {
        const res = await fetch("/api/resolve-maps-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlValue }),
        });
        const data = await res.json();
        if (data?.finalUrl) {
          const resolvedCoords = parseGoogleMapsUrl(data.finalUrl);
          if (resolvedCoords) {
            setLatitude(String(resolvedCoords.lat));
            setLongitude(String(resolvedCoords.lng));
            setToast({
              type: "success",
              message: `Auto-extracted coordinates: ${resolvedCoords.lat}, ${resolvedCoords.lng}`,
            });
          }
        }
      } catch (e) {
        console.warn("Could not resolve short maps link:", e);
      }
    }
  }

  // Detect current GPS location via browser Geolocation API
  function handleGetBrowserLocation() {
    if (!navigator.geolocation) {
      setToast({
        type: "error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        if (!googleMapsUrl) {
          setGoogleMapsUrl(`https://www.google.com/maps/@${lat},${lng},17z`);
        }
        setToast({
          type: "success",
          message: `GPS location detected: ${lat}, ${lng}`,
        });
      },
      () => {
        setToast({
          type: "error",
          message: "Unable to retrieve GPS location. Please check browser permissions.",
        });
      }
    );
  }

  // Handle Logo File Select & Upload via POST /api/v1/files/upload (Allowed: jpeg, png, webp, gif | Max 5MB)
  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // HEIC / HEIF format check
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (file.type.includes("heic") || file.type.includes("heif") || ext === "heic" || ext === "heif") {
      setToast({
        type: "error",
        message: "iPhone HEIC photos are not supported. Please convert your photo to JPEG or PNG before uploading.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Shop logo image size must be 5MB or less.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      if (!logoUri) setLogoUri(dataUrl);
    };
    reader.readAsDataURL(file);

    try {
      const res = await uploadLogoFile(file).unwrap();
      if (res?.objectName) {
        setLogoObjectName(res.objectName);
      }
      if (res?.uri || res?.url) {
        setLogoUri(res.uri || res.url || "");
      }
      setToast({
        type: "success",
        message: "Shop logo uploaded successfully!",
      });
    } catch (err: any) {
      const serverMsg = err?.data?.message || err?.message || "Failed to upload logo image.";
      console.warn("Server logo upload response:", serverMsg);

      setToast({
        type: "error",
        message: serverMsg,
      });
    }
  }

  // Step 1 Submit -> Proceed to Step 2 (Document Upload)
  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) {
      setToast({
        type: "error",
        message: "Please correct the highlighted form errors.",
      });
      return;
    }

    try {
      let finalLat = latitude.trim() ? parseFloat(latitude) : undefined;
      let finalLng = longitude.trim() ? parseFloat(longitude) : undefined;

      if ((finalLat === undefined || isNaN(finalLat) || finalLng === undefined || isNaN(finalLng)) && googleMapsUrl.trim()) {
        const parsed = parseGoogleMapsUrl(googleMapsUrl.trim());
        if (parsed) {
          finalLat = parsed.lat;
          finalLng = parsed.lng;
          setLatitude(String(parsed.lat));
          setLongitude(String(parsed.lng));
        }
      }

      const payload = {
        businessName: businessName.trim(),
        storeDisplayName: storeDisplayName.trim() || businessName.trim(),
        businessType,
        description: description.trim() || undefined,
        logoObjectName: logoObjectName || undefined,
        logoUri: logoUri || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        province: province.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        latitude: finalLat !== undefined && !isNaN(finalLat) ? finalLat : undefined,
        longitude: finalLng !== undefined && !isNaN(finalLng) ? finalLng : undefined,
      };

      await createApplication(payload).unwrap();
      setToast({
        type: "success",
        message: "Business information saved! Proceed to document upload.",
      });
      setReapplying(false);
      setInitialSynced(true);
      setStep(2);
      refetchApp();
    } catch (err: any) {
      console.error("Step 1 submit error:", err);
      const serverMessage = err?.data?.message || err?.message || "Failed to submit business details.";
      setNonFieldError(serverMessage);

      const serverFieldErrors: Record<string, string> = {};
      if (Array.isArray(err?.data?.errorDetails)) {
        err.data.errorDetails.forEach((item: any) => {
          if (item.field && item.fieldMessage) {
            serverFieldErrors[item.field] = item.fieldMessage;
          }
        });
      }

      setFieldErrors(serverFieldErrors);
      setToast({
        type: "error",
        message: serverMessage,
      });
    }
  }

  // Handle Verification Document Upload (ID_CARD, BUSINESS_LICENSE, OTHER)
  // Step 1: Upload document file to POST /api/v1/files/documents (Allowed: pdf, jpeg, png, doc, docx | Max 10MB) -> get objectName
  // Step 2: Attach document metadata JSON { docType, objectName } to POST /api/v1/seller-applications/me/documents
  async function handleDocumentUpload(docType: DocumentType, file: File) {
    // HEIC / HEIF format check
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (file.type.includes("heic") || file.type.includes("heif") || ext === "heic" || ext === "heif") {
      setToast({
        type: "error",
        message: "iPhone HEIC photos are not supported. Please convert your document photo to JPEG, PNG, or PDF before uploading.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Document file size must be 10MB or less.",
      });
      return;
    }

    setUploadingDocType(docType);
    setNonFieldError(null);

    try {
      // 1. Upload file to document endpoint (/api/v1/files/documents)
      const fileRes = await uploadDocumentFile(file).unwrap();
      const objectName = fileRes?.objectName;

      if (!objectName) {
        throw new Error("Document upload did not return objectName from server.");
      }

      // 2. Attach document metadata JSON with exact docType and objectName properties to /seller-applications/me/documents
      await attachDocument({
        docType,
        objectName,
      }).unwrap();

      // Optimistically update local document state immediately
      setLocalDocs((prev) => ({
        ...prev,
        [docType]: {
          fileName: file.name,
          uri: fileRes?.uri || fileRes?.url || "",
        },
      }));

      setToast({
        type: "success",
        message: `${docType.replace("_", " ")} uploaded and attached successfully!`,
      });
      refetchApp();
    } catch (err: any) {
      console.error("Document upload error details:", err);
      const serverMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to upload document.";

      const exceptionName = err?.data?.exception || err?.data?.status;
      const fullErrorText = exceptionName
        ? `[${exceptionName}] ${serverMsg}`
        : serverMsg;

      setNonFieldError(fullErrorText);
      setToast({
        type: "error",
        message: serverMsg,
      });
    } finally {
      setUploadingDocType(null);
    }
  }

  const isLoading = sessionPending || profileLoading || appLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center py-20 bg-[#F8F7FB]">
        <Loader2 className="h-10 w-10 animate-spin text-[#6C4CD8]" />
        <p className="mt-4 text-sm font-semibold text-[#6B6580]">
          Loading seller registration details...
        </p>
      </div>
    );
  }

  const isSeller = (profile as any)?.isSeller;
  const currentApp = sellerApp && sellerApp.status !== "NOT_FOUND" && !reapplying ? sellerApp : null;
  const appStatus = currentApp?.status;
  const attachedDocs = currentApp?.documents || [];

  const licenseDoc =
    attachedDocs.find(
      (d) => d.type === "BUSINESS_LICENSE" || (d as any).docType === "BUSINESS_LICENSE"
    ) || localDocs["BUSINESS_LICENSE"];

  const idCardDoc =
    attachedDocs.find(
      (d) => d.type === "ID_CARD" || (d as any).docType === "ID_CARD"
    ) || localDocs["ID_CARD"];

  const otherDocs = [
    ...attachedDocs.filter(
      (d) => d.type === "OTHER" || (d as any).docType === "OTHER"
    ),
    ...(localDocs["OTHER"]
      ? [
          {
            id: "local-other",
            type: "OTHER" as DocumentType,
            fileName: localDocs["OTHER"].fileName,
            uri: localDocs["OTHER"].uri || "",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FB] pb-20 font-sans">
      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-r from-[#1A1330] via-[#2A1D4E] to-[#6C4CD8] text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-white/70">
            <Link href="/home" className="transition hover:text-white">
              Home
            </Link>
            <ChevronsUpDown size={14} className="text-white/40" />
            <Link href="/account" className="transition hover:text-white">
              My Account
            </Link>
            <ChevronsUpDown size={14} className="text-white/40" />
            <span className="font-semibold text-white">Seller Registration</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur shadow-xl ring-1 ring-white/20">
              <Store size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {isSeller ? "Active Seller Portal" : "Become a Seller on Phsar Digital"}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {isSeller
                  ? "Your seller store is registered, verified, and active on Phsar Digital."
                  : "Register shop details, upload verification documents, and start selling online."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── CASE A: Active Seller Account ── */}
        {isSeller && (
          <div className="overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#EAE7F3] pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                  <ShieldCheck size={36} />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={14} /> Active Seller Account
                  </span>
                  <h2 className="mt-1.5 text-2xl font-extrabold text-[#1A1330]">
                    Your Seller Store is Approved & Verified!
                  </h2>
                  <p className="text-xs text-[#6B6580] mt-0.5">
                    You are already registered as an active merchant. Registration is complete.
                  </p>
                </div>
              </div>

              <Link
                href="/seller-dashboard/home"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#6C4CD8] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6C4CD8]/25 hover:bg-[#5C3DC8] transition shrink-0"
              >
                <Store size={18} /> Open Seller Dashboard <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/seller-dashboard/home"
                className="flex flex-col justify-between rounded-2xl bg-[#F8F7FB] border border-[#E2DFEC] p-5 text-[#1A1330] transition hover:border-[#6C4CD8] hover:bg-[#EDE9FB] group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C4CD8] flex items-center justify-center mb-3">
                    <Store size={20} />
                  </div>
                  <p className="text-base font-bold text-[#1A1330] group-hover:text-[#6C4CD8]">
                    Seller Dashboard
                  </p>
                  <p className="text-xs text-[#8D86A8] mt-1">
                    Track revenue, orders, and sales reports
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#6C4CD8]">
                  Go to Dashboard <ArrowRight size={14} />
                </div>
              </Link>

              <Link
                href="/seller-dashboard/products/dashboard"
                className="flex flex-col justify-between rounded-2xl bg-[#F8F7FB] border border-[#E2DFEC] p-5 text-[#1A1330] transition hover:border-[#6C4CD8] hover:bg-[#EDE9FB] group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    <ShoppingBag size={20} />
                  </div>
                  <p className="text-base font-bold text-[#1A1330] group-hover:text-[#6C4CD8]">
                    Product Inventory
                  </p>
                  <p className="text-xs text-[#8D86A8] mt-1">
                    Add, update, or remove store listings
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#6C4CD8]">
                  Manage Products <ArrowRight size={14} />
                </div>
              </Link>

              <Link
                href="/subscriptions"
                className="flex flex-col justify-between rounded-2xl bg-[#F8F7FB] border border-[#E2DFEC] p-5 text-[#1A1330] transition hover:border-[#6C4CD8] hover:bg-[#EDE9FB] group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-base font-bold text-[#1A1330] group-hover:text-[#6C4CD8]">
                    Seller Subscription
                  </p>
                  <p className="text-xs text-[#8D86A8] mt-1">
                    View or upgrade your listing plan limits
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#6C4CD8]">
                  View Plans <ExternalLink size={14} />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ── CASE B: Application REJECTED ── */}
        {!isSeller && appStatus === "REJECTED" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-rose-100 p-3 text-rose-700">
                <XCircle size={32} />
              </div>
              <div>
                <span className="rounded-full bg-rose-200 px-3 py-0.5 text-xs font-bold text-rose-900">
                  APPLICATION REJECTED
                </span>
                <h2 className="mt-1 text-2xl font-bold text-rose-950">
                  Application Needs Correction
                </h2>

                {currentApp?.rejectionNote && (
                  <div className="mt-3 rounded-xl border border-rose-300 bg-white p-4">
                    <p className="text-xs font-bold text-rose-800">Reviewer Note:</p>
                    <p className="mt-1 text-sm font-medium text-rose-950">{currentApp.rejectionNote}</p>
                  </div>
                )}

                <p className="mt-4 text-sm text-rose-900">
                  You can update your business details or re-upload your documents to submit a new application.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setReapplying(true);
                    setStep(1);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-rose-700"
                >
                  <RotateCcw size={16} /> Re-apply / Edit Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CASE C: Multi-Step Registration & Status Wizard Flow ── */}
        {!isSeller && appStatus !== "REJECTED" && (
          <div className="space-y-6">
            {/* ── Figma Step Progress Header ── */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:gap-4">
              {/* Step 1 Indicator */}
              <div
                onClick={() => setStep(1)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl p-3 text-center transition cursor-pointer hover:bg-[#F8F7FB]",
                  step === 1 ? "bg-[#EDE9FB] text-[#6C4CD8]" : "bg-transparent text-[#8D86A8]"
                )}
                title="View Step 1: Business Information"
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    step === 1 ? "bg-[#6C4CD8] text-white" : "bg-[#EDEBF3] text-[#8D86A8]"
                  )}
                >
                  1
                </div>
                <span className="text-xs font-bold">Business Information</span>
              </div>

              {/* Step 2 Indicator */}
              <div
                onClick={() => setStep(2)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl p-3 text-center transition cursor-pointer hover:bg-[#F8F7FB]",
                  step === 2 ? "bg-[#EDE9FB] text-[#6C4CD8]" : "bg-transparent text-[#8D86A8]"
                )}
                title="View Step 2: Document Upload"
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    step === 2 ? "bg-[#6C4CD8] text-white" : "bg-[#EDEBF3] text-[#8D86A8]"
                  )}
                >
                  2
                </div>
                <span className="text-xs font-bold">Document Upload</span>
              </div>

              {/* Step 3 Indicator */}
              <div
                onClick={() => setStep(3)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl p-3 text-center transition cursor-pointer hover:bg-[#F8F7FB]",
                  step === 3 ? "bg-[#EDE9FB] text-[#6C4CD8]" : "bg-transparent text-[#8D86A8]"
                )}
                title="View Step 3: Waiting Approval Status"
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    step === 3 ? "bg-[#6C4CD8] text-white" : "bg-[#EDEBF3] text-[#8D86A8]"
                  )}
                >
                  3
                </div>
                <span className="text-xs font-bold">Waiting Approval</span>
              </div>
            </div>

            {/* Non-field error banner */}
            {nonFieldError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm flex items-start gap-3">
                <AlertTriangle size={20} className="shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Error Notice</p>
                  <p className="text-xs text-rose-700 mt-0.5">{nonFieldError}</p>
                </div>
              </div>
            )}

            {/* ── STEP 1: Business Information & Shop Details (Figma Step 1) ── */}
            {step === 1 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
                <div className="border-b border-[#EAE7F3] pb-5">
                  <h2 className="text-xl font-bold text-[#1A1330]">
                    Step 1: Shop & Business Information
                  </h2>
                  <p className="mt-1 text-sm text-[#6B6580]">
                    Enter your shop name, store logo, business type, and location coordinates.
                  </p>
                </div>

                {/* Shop Logo Upload Dropzone */}
                <div className="mt-6 flex flex-col items-start gap-4 rounded-xl border border-[#EDEBF3] bg-[#FAFAFE] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {logoPreview || logoUri ? (
                      <img
                        src={logoPreview || logoUri}
                        alt="Shop Logo"
                        className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[#6C4CD8]/30 shadow-md"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EDE9FB] text-[#6C4CD8] shadow-inner">
                        <Building2 size={32} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-[#1A1330]">Shop Logo</p>
                      <p className="text-xs text-[#8D86A8]">PNG, JPG or WebP up to 5MB.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#EDE9FB] px-5 py-2.5 text-sm font-semibold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white disabled:opacity-50"
                  >
                    {isUploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {logoUri ? "Change Logo" : "Upload Shop Logo"}
                  </button>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                </div>

                <form onSubmit={handleStep1Submit} className="mt-8 space-y-6">
                  {/* Shop Name & Store Display Name */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="businessName" className="mb-2 block text-sm font-semibold text-[#1A1330]">
                        Shop Name / Business Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => {
                          setBusinessName(e.target.value);
                          if (fieldErrors.businessName) setFieldErrors((prev) => ({ ...prev, businessName: "" }));
                        }}
                        placeholder="e.g. Phsar Digital Electronics"
                        maxLength={100}
                        className={cn(
                          "w-full rounded-xl border bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:bg-white focus:outline-none focus:ring-2",
                          fieldErrors.businessName
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                            : "border-[#E2DFEC] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15"
                        )}
                      />
                      {fieldErrors.businessName && (
                        <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.businessName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="storeDisplayName" className="mb-2 block text-sm font-semibold text-[#1A1330]">
                        Store Display Name (Public)
                      </label>
                      <input
                        id="storeDisplayName"
                        type="text"
                        value={storeDisplayName}
                        onChange={(e) => setStoreDisplayName(e.target.value)}
                        placeholder="e.g. Phsar Tech Official Store"
                        maxLength={100}
                        className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Business Type Selector */}
                  <div>
                    <label htmlFor="businessType" className="mb-2 block text-sm font-semibold text-[#1A1330]">
                      Business Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { id: "INDIVIDUAL", label: "Individual", icon: Briefcase },
                        { id: "SOLE_PROPRIETORSHIP", label: "Sole Proprietorship", icon: Store },
                        { id: "PARTNERSHIP", label: "Partnership", icon: Building },
                        { id: "COMPANY", label: "Private Company", icon: Building2 },
                      ].map((item) => {
                        const Icon = item.icon;
                        const selected = businessType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setBusinessType(item.id as any)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition",
                              selected
                                ? "border-[#6C4CD8] bg-[#EDE9FB] text-[#6C4CD8] font-bold shadow-xs"
                                : "border-[#E2DFEC] bg-[#F8F7FB] text-[#5A5470] hover:bg-white"
                            )}
                          >
                            <Icon size={22} />
                            <span className="text-xs">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="mb-2 block text-sm font-semibold text-[#1A1330]">
                      Shop Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell buyers what your store sells..."
                      maxLength={500}
                      className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] p-4 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:bg-white focus:outline-none"
                    />
                    <p className="mt-1 text-right text-xs text-[#8D86A8]">{description.length}/500</p>
                  </div>

                  {/* Business Address & Coordinates */}
                  <div className="border-t border-[#EAE7F3] pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-base font-bold text-[#1A1330] flex items-center gap-2">
                        <MapPin size={18} className="text-[#6C4CD8]" /> Business Address & Map Location
                      </h3>

                      <button
                        type="button"
                        onClick={handleGetBrowserLocation}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#6C4CD8] bg-[#EDE9FB] px-3.5 py-1.5 text-xs font-bold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white"
                      >
                        <Globe size={14} /> Detect Current GPS Location
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label htmlFor="address" className="mb-2 block text-xs font-semibold text-[#1A1330]">
                          Street Address
                        </label>
                        <input
                          id="address"
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Street 271, House #12"
                          maxLength={200}
                          className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] focus:border-[#6C4CD8] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="city" className="mb-2 block text-xs font-semibold text-[#1A1330]">
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Phnom Penh"
                          maxLength={100}
                          className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] focus:border-[#6C4CD8] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="province" className="mb-2 block text-xs font-semibold text-[#1A1330]">
                          Province / Region
                        </label>
                        <input
                          id="province"
                          type="text"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          placeholder="Phnom Penh"
                          maxLength={100}
                          className="w-full rounded-xl border border-[#E2DFEC] bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] focus:border-[#6C4CD8] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label htmlFor="googleMapsUrl" className="mb-2 block text-xs font-semibold text-[#1A1330]">
                          Google Maps Link (Auto-extracts Lat/Long)
                        </label>
                        <input
                          id="googleMapsUrl"
                          type="url"
                          value={googleMapsUrl}
                          onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
                          placeholder="Paste https://maps.google.com/@11.55,104.92..."
                          className={cn(
                            "w-full rounded-xl border bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] focus:bg-white focus:outline-none",
                            fieldErrors.googleMapsUrl ? "border-rose-400" : "border-[#E2DFEC] focus:border-[#6C4CD8]"
                          )}
                        />
                        {fieldErrors.googleMapsUrl && (
                          <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.googleMapsUrl}</p>
                        )}
                        <p className="mt-1 text-[11px] text-[#8D86A8]">
                          Paste a Google Maps link to auto-fill Latitude & Longitude below.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="latitude" className="mb-2 block text-xs font-semibold text-[#1A1330]">
                          Latitude (Auto-filled)
                        </label>
                        <input
                          id="latitude"
                          type="text"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          placeholder="11.5564"
                          className={cn(
                            "w-full rounded-xl border bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] focus:bg-white focus:outline-none",
                            fieldErrors.latitude ? "border-rose-400" : "border-[#E2DFEC] focus:border-[#6C4CD8]"
                          )}
                        />
                        {fieldErrors.latitude && (
                          <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.latitude}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="longitude" className="mb-2 block text-xs font-semibold text-[#1A1330]">
                          Longitude (Auto-filled)
                        </label>
                        <input
                          id="longitude"
                          type="text"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          placeholder="104.9282"
                          className={cn(
                            "w-full rounded-xl border bg-[#F8F7FB] px-4 py-3 text-sm text-[#1A1330] focus:bg-white focus:outline-none",
                            fieldErrors.longitude ? "border-rose-400" : "border-[#E2DFEC] focus:border-[#6C4CD8]"
                          )}
                        />
                        {fieldErrors.longitude && (
                          <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.longitude}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Next Step Button */}
                  <div className="flex items-center justify-end border-t border-[#EAE7F3] pt-6">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-[#6C4CD8]/20 transition hover:bg-[#5C3DC8] disabled:opacity-50"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Proceed to Step 2: Document Upload <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── STEP 2: Dedicated Document Upload Slots (Figma Step 2) ── */}
            {step === 2 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8 space-y-6">
                <div className="border-b border-[#EAE7F3] pb-5">
                  <h2 className="text-xl font-bold text-[#1A1330]">
                    Step 2: Verification Document Upload
                  </h2>
                  <p className="mt-1 text-sm text-[#6B6580]">
                    Attach official business licensing and identification documents. Images or PDF files up to 10MB each.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Slot 1: Business License */}
                  <div className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-[#6C4CD8]/30 bg-[#FAFAFE] p-6 text-center">
                    <div>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE9FB] text-[#6C4CD8]">
                        <FileText size={28} />
                      </div>
                      <h3 className="mt-3 text-base font-bold text-[#1A1330]">Business License / Patent</h3>
                      <p className="mt-1 text-xs text-[#8D86A8]">
                        Official company registration patent or trade license document.
                      </p>

                      {licenseDoc ? (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                            <span className="truncate text-xs font-bold">{licenseDoc.fileName || "License Attached"}</span>
                          </div>
                          {licenseDoc.uri && (
                            <a
                              href={licenseDoc.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-[#6C4CD8] underline ml-2"
                            >
                              View
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs font-semibold">
                          Status: Missing (Required)
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => licenseInputRef.current?.click()}
                        disabled={uploadingDocType === "BUSINESS_LICENSE"}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#5C3DC8] disabled:opacity-50"
                      >
                        {uploadingDocType === "BUSINESS_LICENSE" ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {licenseDoc ? "Re-upload Business License" : "Upload Business License"}
                      </button>

                      <input
                        ref={licenseInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentUpload("BUSINESS_LICENSE", file);
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Slot 2: National ID Card / Passport */}
                  <div className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-[#6C4CD8]/30 bg-[#FAFAFE] p-6 text-center">
                    <div>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE9FB] text-[#6C4CD8]">
                        <IdCard size={28} />
                      </div>
                      <h3 className="mt-3 text-base font-bold text-[#1A1330]">National ID Card / Passport</h3>
                      <p className="mt-1 text-xs text-[#8D86A8]">
                        Government-issued identity card or passport of store owner.
                      </p>

                      {idCardDoc ? (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                            <span className="truncate text-xs font-bold">{idCardDoc.fileName || "ID Attached"}</span>
                          </div>
                          {idCardDoc.uri && (
                            <a
                              href={idCardDoc.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-[#6C4CD8] underline ml-2"
                            >
                              View
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs font-semibold">
                          Status: Missing (Required)
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => idCardInputRef.current?.click()}
                        disabled={uploadingDocType === "ID_CARD"}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#5C3DC8] disabled:opacity-50"
                      >
                        {uploadingDocType === "ID_CARD" ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {idCardDoc ? "Re-upload ID / Passport" : "Upload ID Card / Passport"}
                      </button>

                      <input
                        ref={idCardInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentUpload("ID_CARD", file);
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional / Other Documents */}
                <div className="rounded-xl border border-[#EDEBF3] p-4 bg-[#FAFAFE]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#1A1330]">Other Supporting Documents (Optional)</p>
                      <p className="text-xs text-[#8D86A8]">Tax certificates, bank statement, or brand authorization letter.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => otherInputRef.current?.click()}
                      disabled={uploadingDocType === "OTHER"}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#6C4CD8] bg-white px-4 py-2 text-xs font-bold text-[#6C4CD8] hover:bg-[#EDE9FB]"
                    >
                      {uploadingDocType === "OTHER" ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      Attach Other Doc
                    </button>

                    <input
                      ref={otherInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload("OTHER", file);
                      }}
                      className="hidden"
                    />
                  </div>

                  {otherDocs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {otherDocs.map((doc) => (
                        <span key={doc.id || doc.uri} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-xs font-medium text-[#1A1330] border border-[#E2DFEC]">
                          <FileCheck size={14} className="text-emerald-600" />
                          {doc.fileName || "Other Doc"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit & Step Navigation */}
                <div className="flex items-center justify-between border-t border-[#EAE7F3] pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-[#E2DFEC] px-5 py-2.5 text-xs font-bold text-[#5A5470] hover:bg-[#F8F7FB]"
                  >
                    ← Back to Business Info
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-8 py-3 text-sm font-bold text-white shadow-md shadow-[#6C4CD8]/20 hover:bg-[#5C3DC8]"
                  >
                    Submit for Approval <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Waiting for Approval / Status Dashboard (Figma Step 3) ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-8 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-inner">
                    <Clock size={36} className="animate-pulse" />
                  </div>
                  <span className="mt-4 inline-block rounded-full bg-amber-200 px-3.5 py-1 text-xs font-bold text-amber-900">
                    STATUS: UNDER REVIEW / WAITING FOR APPROVAL
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-amber-950 sm:text-3xl">
                    Application Submitted & Waiting for Approval
                  </h2>
                  <p className="mt-2 text-sm text-amber-800 max-w-xl mx-auto">
                    Your store details and documents have been received. Our compliance team is currently reviewing your registration.
                  </p>
                </div>

                {/* Application Details Summary */}
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EAE7F3] pb-4">
                    <h3 className="text-lg font-bold text-[#1A1330]">Submitted Application Overview</h3>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-xl border border-[#E2DFEC] px-3.5 py-1.5 text-xs font-bold text-[#5A5470] hover:bg-[#F8F7FB] transition"
                      >
                        ← Review Step 1 Info
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-xl border border-[#6C4CD8] bg-[#EDE9FB] px-3.5 py-1.5 text-xs font-bold text-[#6C4CD8] hover:bg-[#6C4CD8] hover:text-white transition"
                      >
                        ← Manage Documents
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold text-[#8D86A8]">Shop / Business Name</p>
                      <p className="text-base font-bold text-[#1A1330]">{currentApp?.businessName || businessName}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#8D86A8]">Business Type</p>
                      <p className="text-sm font-bold text-[#1A1330]">
                        {(currentApp?.businessType || businessType).replace("_", " ")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#8D86A8]">Location</p>
                      <p className="text-sm font-medium text-[#1A1330]">
                        {[currentApp?.address || address, currentApp?.city || city, currentApp?.province || province].filter(Boolean).join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Documents Status List */}
                  <div className="mt-6 border-t border-[#EAE7F3] pt-4">
                    <h4 className="text-xs font-bold text-[#8D86A8] uppercase tracking-wider">Attached Verification Documents</h4>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-[#EDEBF3] p-3 bg-[#FAFAFE]">
                        <div className="flex items-center gap-2">
                          <FileCheck size={18} className={licenseDoc ? "text-emerald-600" : "text-amber-500"} />
                          <span className="text-xs font-bold text-[#1A1330]">Business License</span>
                        </div>
                        <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md", licenseDoc ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>
                          {licenseDoc ? "Uploaded" : "Missing"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-[#EDEBF3] p-3 bg-[#FAFAFE]">
                        <div className="flex items-center gap-2">
                          <FileCheck size={18} className={idCardDoc ? "text-emerald-600" : "text-amber-500"} />
                          <span className="text-xs font-bold text-[#1A1330]">ID Card / Passport</span>
                        </div>
                        <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md", idCardDoc ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>
                          {idCardDoc ? "Uploaded" : "Missing"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Back Navigation Bar */}
                <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-[#E2DFEC] px-5 py-2.5 text-xs font-bold text-[#5A5470] hover:bg-[#F8F7FB]"
                  >
                    ← Back to Step 1: Business Information
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl border border-[#6C4CD8] bg-[#EDE9FB] px-5 py-2.5 text-xs font-bold text-[#6C4CD8] hover:bg-[#6C4CD8] hover:text-white transition"
                  >
                    ← Back to Step 2: Document Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AuthToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
