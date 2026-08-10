"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Info,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
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

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

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
    }
  }

  /* password strength indicator */
  const pwStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;
  const pwLabels = ["", "Weak", "Fair", "Strong"];
  const pwColors = ["", "bg-red-400", "bg-yellow-400", "bg-emerald-400"];
  const pwTexts = ["", "text-red-500", "text-yellow-500", "text-emerald-600"];

  const benefitItems = [
    "Free to browse thousands of products",
    "Secure checkout with buyer protection",
    "Track orders in real time",
  ];

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#f4f3f8_50%,_#efeafc_100%)] font-sans">
      <AuthLeftPanel
        headline={
          <>
            Your marketplace
            <br />
            <span className="text-[#C4AFFE]">journey starts here.</span>
          </>
        }
        sub="Join thousands of shoppers on Phsar Digital and access a curated ecosystem of verified vendors."
        extra={
          <ul className="space-y-3">
            {benefitItems.map((b) => (
              <li
                key={b}
                className="flex items-center gap-2.5 text-[14px] text-white/80"
              >
                <CheckCircle2
                  size={15}
                  className="flex-shrink-0 text-[#A78BFA]"
                />
                {b}
              </li>
            ))}
          </ul>
        }
      />

      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-12 sm:px-8">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4CD8]">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-base font-bold text-[#1A1330]">
              Phsar Digital
            </span>
          </div>

          {success ? (
            <div className="animate-[fadeIn_0.35s_ease-out] rounded-2xl bg-white px-8 py-12 text-center shadow-[0_20px_60px_rgba(108,76,216,0.12)] ring-1 ring-black/5">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-[22px] font-bold text-[#1A1330]">
                Account created!
              </h2>
              <p className="mt-2 text-[14px] text-[#6B6580]">
                Welcome to Phsar Digital. You can now sign in and start
                shopping.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-7 py-3 text-[14px] font-semibold text-white hover:bg-[#5C3DC8]"
              >
                Go to Sign In <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="animate-[fadeIn_0.35s_ease-out] rounded-2xl bg-white px-8 py-9 shadow-[0_20px_60px_rgba(108,76,216,0.12)] ring-1 ring-black/5">
              <div className="mb-6">
                <h1 className="text-[26px] font-bold leading-tight text-[#1A1330]">
                  Create your account
                </h1>
                <p className="mt-1.5 text-[14px] text-[#6B6580]">
                  Free forever. No credit card required.
                </p>
              </div>

              <div className="mb-6 flex gap-3 rounded-xl border border-[#E7DEFF] bg-[#F7F4FF] px-4 py-3.5">
                <Info
                  size={16}
                  className="mt-0.5 flex-shrink-0 text-[#6C4CD8]"
                />
                <div>
                  <p className="text-[13px] font-semibold text-[#3B2A85]">
                    Buyer account
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-[#6B6580]">
                    You&apos;ll be registered as a buyer and can purchase from
                    any vendor instantly.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
              >
                <Field
                  label="First Name"
                  htmlFor="firstName"
                  error={errors.firstName?.message}
                >
                  <InputBox
                    id="firstName"
                    icon={<User size={15} className="text-[#B0A8C8]" />}
                    inputProps={register("firstName")}
                    placeholder="John"
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                  />
                </Field>

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
                  </Field>

                  <Field
                    label="Confirm Password"
                    htmlFor="confirmPassword"
                    error={errors.confirmPassword?.message}
                  >
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0A8C8]"
                      />
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={cn(
                          "w-full rounded-xl border bg-[#FAFAFE] py-3 pl-10 pr-11 text-[14px] text-[#1A1330] placeholder:text-[#C0B8D0] focus:outline-none focus:ring-2",
                          confirmPassword && password !== confirmPassword
                            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                            : errors.confirmPassword
                              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                              : "border-[#E4DFEF] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15",
                        )}
                        {...register("confirmPassword")}
                      />
                      <EyeBtn
                        show={showConfirm}
                        onToggle={() => setShowConfirm((s) => !s)}
                      />
                      {confirmPassword && password === confirmPassword && (
                        <CheckCircle2
                          size={15}
                          className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500"
                        />
                      )}
                    </div>
                  </Field>
                </div>

                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[#6C4CD8]"
                    {...register("agreed")}
                  />
                  <span className="text-[13px] leading-relaxed text-[#5A5470]">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-semibold text-[#6C4CD8] hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-[#6C4CD8] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {errors.agreed?.message && (
                  <p className="text-[12px] text-rose-600">
                    {errors.agreed.message}
                  </p>
                )}

                {errors.root?.message && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-600">
                    {errors.root.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!agreed || isSubmitting || isRegistering}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold text-white transition-all shadow-[0_10px_24px_rgba(108,76,216,0.2)]",
                    !agreed || isSubmitting || isRegistering
                      ? "cursor-not-allowed bg-[#C7C2D6]"
                      : "bg-[#6C4CD8] hover:bg-[#5C3DC8] active:scale-[0.98]",
                  )}
                >
                  {isSubmitting || isRegistering ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account…
                    </span>
                  ) : (
                    <>
                      Create Account <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-xl border border-dashed border-[#DDD8EE] bg-[#FCFBFF] px-5 py-5 text-center">
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
            <Link
              href="/privacy"
              className="font-medium text-[#6C4CD8] hover:underline"
            >
              Privacy
            </Link>
            {" & "}
            <Link
              href="/terms"
              className="font-medium text-[#6C4CD8] hover:underline"
            >
              Terms
            </Link>
          </p>
        </div>
      </div>

      <AuthToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  error,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[13px] font-semibold text-[#1A1330]"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[12px] text-rose-600">{error}</p>}
    </div>
  );
}

function InputBox({
  id,
  icon,
  type = "text",
  inputProps,
  placeholder,
  autoComplete,
  error,
}: {
  id: string;
  icon: React.ReactNode;
  type?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-xl border bg-[#FAFAFE] py-3 pl-10 pr-4 text-[14px] text-[#1A1330] placeholder:text-[#C0B8D0] focus:outline-none focus:ring-2",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
            : "border-[#E4DFEF] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15",
        )}
        {...inputProps}
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
