"use client";

import { useState } from "react";
import Link from "next/link";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
import { Info, User, Mail, Lock, Eye, EyeOff, Phone, AtSign, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import { registerUser } from "@/app/api/auth";
=======
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, User, Mail, Lock, Eye, EyeOff, ArrowUpDown, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import { useRegisterMutation } from "@/lib/api/authApi";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";

function generateUsername(firstName: string, lastName: string): string {
  const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  let username = `${cleanFirst}${cleanLast}`;
  if (username.length < 3) {
    username = `${username}user`;
  }
  if (username.length < 3) {
    username = "user123";
  }
  return username.slice(0, 50);
}

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().email("Enter a valid email address."),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^[0-9]{9,11}$/, "Phone number must be 9 to 11 digits."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    agreed: z.boolean().refine((value) => value, {
      message: "Please accept the Terms of Service.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;
>>>>>>> origin/main

export default function RegisterPage() {
  const router = useRouter();

<<<<<<< HEAD
  const [firstName,    setFirstName]    = useState("");
  const [lastName,     setLastName]     = useState("");
  const [username,     setUsername]     = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [password,     setPassword]     = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [agreed,       setAgreed]       = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim())           return setError("First name is required.");
    if (!lastName.trim())            return setError("Last name is required.");
    if (!username.trim())            return setError("Username is required.");
    if (!email.includes("@"))        return setError("Enter a valid email address.");
    if (!/^\d{9,11}$/.test(phone))   return setError("Phone must be 9–11 digits.");
    if (password.length < 8)         return setError("Password must be at least 8 characters.");
    if (password !== confirmPw)      return setError("Passwords do not match.");
    if (!agreed)                     return setError("Please accept the Terms of Service.");
    setSubmitting(true);
    try {
      await registerUser({
        firstName:       firstName.trim(),
        lastName:        lastName.trim(),
        username:        username.trim(),
        email:           email.trim(),
        phoneNumber:     phone.trim(),
        password,
        confirmPassword: confirmPw,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
=======
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreed: false,
    },
  });

  const password = watch("password") ?? "";
  const confirmPassword = watch("confirmPassword") ?? "";
  const agreed = watch("agreed") ?? false;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function onSubmit(values: RegisterFormValues) {
    clearErrors("root");
    setToast(null);

    const generatedUsername = generateUsername(
      values.firstName,
      values.lastName,
    );

    try {
      await registerUser({
        username: generatedUsername,
        password: values.password,
        confirmPassword: values.confirmPassword,
        email: values.email.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phoneNumber: values.phoneNumber.trim(),
      }).unwrap();

      setSuccess(true);
      setToast({
        type: "success",
        message: "Account created successfully. You can sign in now.",
      });
    } catch (err: any) {
      let msg = "Something went wrong. Please try again.";
      if (err && typeof err === "object") {
        const errorData = err.data;
        if (errorData && typeof errorData === "object") {
          if (
            Array.isArray(errorData.errorDetails) &&
            errorData.errorDetails.length > 0
          ) {
            msg = errorData.errorDetails
              .map((d: any) => d.fieldMessage || d.message || d.field)
              .filter(Boolean)
              .join(", ");
          } else {
            msg =
              errorData.message ||
              errorData.error ||
              errorData.detail ||
              msg;
          }
        } else if (err.message) {
          msg = err.message;
        }
      }

      setError("root", { message: msg });
      setToast({ type: "error", message: msg });
>>>>>>> origin/main
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
                Welcome to Phsar Digital.
              </p>
              <div className="mt-4 rounded-xl bg-[#FFF8E7] border border-yellow-200 px-4 py-3 text-left">
                <p className="text-[13px] font-semibold text-yellow-800">📧 Check your email</p>
                <p className="mt-1 text-[13px] text-yellow-700">
                  We sent a verification link to <strong>{email}</strong>. Please verify your email before signing in.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-7 py-3 text-[14px] font-semibold text-white hover:bg-[#5C3DC8]"
              >
                Go to Sign In <ArrowUpDown size={15} />
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

<<<<<<< HEAD
                {/* first + last name */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" htmlFor="firstName">
                    <InputBox id="firstName" icon={<User size={15} className="text-[#B0A8C8]" />}
                      value={firstName} onChange={setFirstName} placeholder="John" autoComplete="given-name" />
=======
                <Field
                  label="Last Name"
                  htmlFor="lastName"
                  error={errors.lastName?.message}
                >
                  <InputBox
                    id="lastName"
                    icon={<User size={15} className="text-[#B0A8C8]" />}
                    inputProps={register("lastName")}
                    placeholder="Doe"
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                  />
                </Field>



                <Field
                  label="Email Address"
                  htmlFor="email"
                  error={errors.email?.message}
                >
                  <InputBox
                    id="email"
                    icon={<Mail size={15} className="text-[#B0A8C8]" />}
                    type="email"
                    inputProps={register("email")}
                    placeholder="john@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                  />
                </Field>

                <Field
                  label="Phone Number"
                  htmlFor="phoneNumber"
                  error={errors.phoneNumber?.message}
                >
                  <InputBox
                    id="phoneNumber"
                    icon={<User size={15} className="text-[#B0A8C8]" />}
                    inputProps={register("phoneNumber")}
                    placeholder="012345678"
                    autoComplete="tel"
                    error={errors.phoneNumber?.message}
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Password"
                    htmlFor="password"
                    error={errors.password?.message}
                  >
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0A8C8]"
                      />
                      <input
                        id="password"
                        type={showPw ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        className={cn(
                          "w-full rounded-xl border bg-[#FAFAFE] py-3 pl-10 pr-11 text-[14px] text-[#1A1330] placeholder:text-[#C0B8D0] focus:outline-none focus:ring-2",
                          errors.password
                            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                            : "border-[#E4DFEF] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15",
                        )}
                        {...register("password")}
                      />
                      <EyeBtn
                        show={showPw}
                        onToggle={() => setShowPw((s) => !s)}
                      />
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3].map((n) => (
                            <div
                              key={n}
                              className={cn(
                                "h-1 flex-1 rounded-full transition-all",
                                pwStrength >= n
                                  ? pwColors[pwStrength]
                                  : "bg-[#EAE7F3]",
                              )}
                            />
                          ))}
                        </div>
                        <span
                          className={cn(
                            "text-[11px] font-semibold",
                            pwTexts[pwStrength],
                          )}
                        >
                          {pwLabels[pwStrength]}
                        </span>
                      </div>
                    )}
>>>>>>> origin/main
                  </Field>
                  <Field label="Last Name" htmlFor="lastName">
                    <InputBox id="lastName" icon={<User size={15} className="text-[#B0A8C8]" />}
                      value={lastName} onChange={setLastName} placeholder="Doe" autoComplete="family-name" />
                  </Field>
                </div>

                {/* username */}
                <Field label="Username" htmlFor="username">
                  <InputBox id="username" icon={<AtSign size={15} className="text-[#B0A8C8]" />}
                    value={username} onChange={setUsername} placeholder="johndoe123" autoComplete="username" />
                </Field>

                {/* email */}
                <Field label="Email Address" htmlFor="email">
                  <InputBox id="email" icon={<Mail size={15} className="text-[#B0A8C8]" />}
                    type="email" value={email} onChange={setEmail}
                    placeholder="john@example.com" autoComplete="email" />
                </Field>

                {/* phone */}
                <Field label="Phone Number" htmlFor="phone">
                  <InputBox id="phone" icon={<Phone size={15} className="text-[#B0A8C8]" />}
                    type="tel" value={phone} onChange={setPhone}
                    placeholder="012xxxxxxx (9–11 digits)" autoComplete="tel" />
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
<<<<<<< HEAD
                  disabled={!agreed || submitting}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold text-white transition-all",
                    !agreed || submitting
=======
                  disabled={!agreed || isSubmitting || isRegistering}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold text-white transition-all shadow-[0_10px_24px_rgba(108,76,216,0.2)]",
                    !agreed || isSubmitting || isRegistering
>>>>>>> origin/main
                      ? "cursor-not-allowed bg-[#C7C2D6]"
                      : "bg-[#6C4CD8] hover:bg-[#5C3DC8] active:scale-[0.98]"
                  )}
                >
<<<<<<< HEAD
                  {submitting ? (
=======
                  {isSubmitting || isRegistering ? (
>>>>>>> origin/main
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account…
                    </span>
                  ) : (
<<<<<<< HEAD
                    <>Create Account <ArrowRight size={16} /></>
=======
                    <>
                      Create Account <ArrowUpDown size={16} />
                    </>
>>>>>>> origin/main
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
                  Sign in instead <ArrowUpDown size={14} />
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
