"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowUpDown,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailCheck,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";
import {
  useRegisterMutation,
  useResendVerificationEmailMutation,
} from "@/lib/api/authApi";

/**
 * Mirrors RegisterRequest from the API so the form rejects what the server
 * would reject, with the same limits:
 *   username     3-50, letters/digits/dot/underscore/hyphen
 *   password     8-128
 *   email        valid, max 254
 *   firstName    max 100
 *   lastName     max 100
 *   phoneNumber  9-11 digits
 */
const USERNAME_RE = /^[\p{L}\p{N}._-]+$/u;

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(100, "First name is too long."),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(100, "Last name is too long."),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(50, "Username must be 50 characters or fewer.")
      .regex(
        USERNAME_RE,
        "Use only letters, numbers, dots, underscores or hyphens."
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .max(254, "Email is too long.")
      .email("Enter a valid email address."),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\d{9,11}$/, "Phone number must be 9 to 11 digits."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    agreed: z.boolean().refine((v) => v, {
      message: "Please accept the Terms of Service.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

/** Field names the API can attach errors to, matched to the form. */
const SERVER_FIELDS = [
  "firstName",
  "lastName",
  "username",
  "email",
  "phoneNumber",
  "password",
  "confirmPassword",
] as const;

type ServerField = (typeof SERVER_FIELDS)[number];

type FieldDetail = { field?: string; fieldMessage?: string };

/**
 * The API is inconsistent here: a 400 returns errorDetails as an array of
 * field problems, while a 409 returns it as a single object describing the
 * exception. Anything reading it has to check which it got.
 */
type ApiError = {
  status?: number;
  data?: {
    message?: string;
    errorDetails?: FieldDetail[] | Record<string, unknown>;
  };
};

/** Build a username suggestion that already satisfies the server pattern. */
function suggestUsername(firstName: string, lastName: string): string {
  const clean = (v: string) =>
    v
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}._-]/gu, "");

  const joined = `${clean(firstName)}${clean(lastName)}`;
  if (joined.length >= 3) return joined.slice(0, 50);
  return joined ? `${joined}_shop`.slice(0, 50) : "";
}

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [resendEmail, { isLoading: isResending }] =
    useResendVerificationEmailMutation();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreed: false,
    },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const password = watch("password");

  // Suggest a username from the name, but stop once the user edits it.
  const usernameTouched = useRef(false);
  useEffect(() => {
    if (usernameTouched.current) return;
    const suggestion = suggestUsername(firstName, lastName);
    if (suggestion) setValue("username", suggestion, { shouldValidate: false });
  }, [firstName, lastName, setValue]);

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser({
        username: values.username.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
        email: values.email.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phoneNumber: values.phoneNumber.trim(),
      }).unwrap();

      setRegisteredEmail(values.email.trim());
    } catch (err) {
      const apiError = err as ApiError;
      const raw = apiError?.data?.errorDetails;
      const details: FieldDetail[] = Array.isArray(raw) ? raw : [];
      const message = apiError?.data?.message;

      // Pin server complaints onto the field they belong to.
      let attached = false;
      for (const detail of details) {
        const field = detail.field as ServerField | undefined;
        if (field && SERVER_FIELDS.includes(field) && detail.fieldMessage) {
          setError(field, { type: "server", message: detail.fieldMessage });
          attached = true;
        }
      }

      // A 409 says "username or email already exists" without telling us which,
      // so flag both rather than leaving the seller hunting.
      if (!attached && apiError?.status === 409) {
        const taken = message || "Username or email already exists.";
        setError("username", { type: "server", message: taken });
        setError("email", { type: "server", message: taken });
        attached = true;
      }

      if (!attached) {
        setToast({
          type: "error",
          message:
            details[0]?.fieldMessage ||
            message ||
            "Registration failed. Please try again.",
        });
      }
    }
  }

  async function handleResend() {
    if (!registeredEmail) return;
    try {
      await resendEmail(registeredEmail).unwrap();
      setToast({ type: "success", message: "Verification email sent again." });
    } catch {
      setToast({
        type: "error",
        message: "Could not resend just now. Try again in a minute.",
      });
    }
  }

  const statsBlock = (
    <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/10 px-6 py-5">
      {[
        { label: "Sellers Onboarded", value: "12,400+" },
        { label: "Free to Join", value: "Always" },
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
            Start Selling
            <br />
            <span className="text-[#C4AFFE]">in Minutes</span>
          </>
        }
        sub="Create your Phsar Digital account to shop from trusted vendors, track every order, and open your own storefront whenever you are ready."
        extra={statsBlock}
      />

      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-12 sm:px-8">
        <div className="w-full max-w-[520px]">
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
            {registeredEmail ? (
              /* ── success ── */
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F8EF]">
                  <CheckCircle2 size={28} className="text-emerald-600" />
                </div>
                <h1 className="text-[26px] font-bold leading-tight text-[#1A1330]">
                  Check your inbox
                </h1>
                <p className="mx-auto mt-2 max-w-[380px] text-[14px] leading-relaxed text-[#6B6580]">
                  Your account is created. We sent a verification link to{" "}
                  <span className="font-semibold text-[#1A1330]">
                    {registeredEmail}
                  </span>
                  . Verify it, then sign in.
                </p>

                <Link
                  href="/auth/login"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(108,76,216,0.25)] transition-all hover:bg-[#5C3DC8] active:scale-[0.98]"
                >
                  Go to sign in <ArrowUpDown size={16} />
                </Link>

                <div className="mt-7 rounded-xl border border-dashed border-[#DDD8EE] bg-[#FCFBFF] px-5 py-5">
                  <p className="mb-3 text-[13px] text-[#6B6580]">
                    Nothing arrived? Check spam, or send it again.
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#EDE9FB] px-6 py-2.5 text-[13px] font-semibold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white disabled:opacity-60"
                  >
                    {isResending ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                        Sending
                      </>
                    ) : (
                      <>
                        <MailCheck size={14} />
                        Resend verification email
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ── form ── */
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE9FB]">
                    <UserPlus size={28} className="text-[#6C4CD8]" />
                  </div>
                  <h1 className="text-[26px] font-bold leading-tight text-[#1A1330]">
                    Create your account
                  </h1>
                  <p className="mt-2 text-[14px] text-[#6B6580]">
                    Join Phsar Digital and start shopping in minutes.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      id="firstName"
                      label="First name"
                      icon={User}
                      placeholder="Sokha"
                      autoComplete="given-name"
                      error={errors.firstName?.message}
                      {...register("firstName")}
                    />
                    <Field
                      id="lastName"
                      label="Last name"
                      icon={User}
                      placeholder="Chan"
                      autoComplete="family-name"
                      error={errors.lastName?.message}
                      {...register("lastName")}
                    />
                  </div>

                  <Field
                    id="username"
                    label="Username"
                    icon={AtSign}
                    placeholder="sokhachan"
                    autoComplete="username"
                    hint="Letters, numbers, dots, underscores or hyphens."
                    error={errors.username?.message}
                    {...register("username", {
                      onChange: () => {
                        usernameTouched.current = true;
                      },
                    })}
                  />

                  <Field
                    id="email"
                    label="Email"
                    type="email"
                    icon={Mail}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />

                  <Field
                    id="phoneNumber"
                    label="Phone number"
                    type="tel"
                    inputMode="numeric"
                    icon={Phone}
                    placeholder="012345678"
                    autoComplete="tel"
                    hint="Digits only, 9 to 11 of them."
                    error={errors.phoneNumber?.message}
                    {...register("phoneNumber")}
                  />

                  <Field
                    id="password"
                    label="Password"
                    type={showPw ? "text" : "password"}
                    icon={Lock}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    trailing={
                      <PeekButton
                        shown={showPw}
                        onClick={() => setShowPw((v) => !v)}
                        label="password"
                      />
                    }
                    {...register("password")}
                  />

                  {password.length > 0 && !errors.password && (
                    <PasswordMeter value={password} />
                  )}

                  <Field
                    id="confirmPassword"
                    label="Confirm password"
                    type={showConfirm ? "text" : "password"}
                    icon={Lock}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    trailing={
                      <PeekButton
                        shown={showConfirm}
                        onClick={() => setShowConfirm((v) => !v)}
                        label="confirmation password"
                      />
                    }
                    {...register("confirmPassword")}
                  />

                  {/* terms */}
                  <div>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        {...register("agreed")}
                        className="mt-0.5 h-4 w-4 rounded border-[#DDD8EE] text-[#6C4CD8] focus:ring-[#6C4CD8]"
                      />
                      <span className="text-[13px] leading-relaxed text-[#6B6580]">
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
                      <p className="mt-1.5 text-[12px] font-medium text-rose-600">
                        {errors.agreed.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className={cn(
                      "mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(108,76,216,0.25)] transition-all",
                      isRegistering
                        ? "cursor-not-allowed bg-[#C7C2D6]"
                        : "bg-[#6C4CD8] hover:bg-[#5C3DC8] active:scale-[0.98]"
                    )}
                  >
                    {isRegistering ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating account
                      </>
                    ) : (
                      <>
                        Create account <ArrowUpDown size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* sign-in link */}
                <div className="mt-7 rounded-xl border border-dashed border-[#DDD8EE] bg-[#FCFBFF] px-5 py-5 text-center">
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
              </>
            )}
          </div>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-[#A09AB8]">
            Your details are stored securely with{" "}
            <span className="font-medium text-[#6C4CD8]">auth.quizzy.it.com</span>
            .
          </p>
        </div>
      </div>

      <AuthToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

/* ── pieces ─────────────────────────────────────────────────────────────── */

type FieldProps = React.ComponentPropsWithRef<"input"> & {
  id: string;
  label: string;
  icon: typeof User;
  hint?: string;
  error?: string;
  trailing?: React.ReactNode;
};

/**
 * react-hook-form's `register` returns a ref, so this has to forward it —
 * otherwise the field registers but never reports its value.
 */
function Field({
  id,
  label,
  icon: Icon,
  hint,
  error,
  trailing,
  ...input
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-semibold text-[#1A1330]"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0CA]"
        />
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            "w-full rounded-xl border bg-white py-3 pl-11 text-[14px] text-[#1A1330] placeholder:text-[#B5B0CA] focus:outline-none focus:ring-2",
            trailing ? "pr-11" : "pr-4",
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-[#E2DFEC] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15"
          )}
          {...input}
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12px] font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12px] text-[#9B94B4]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function PeekButton({
  shown,
  onClick,
  label,
}: {
  shown: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${shown ? "Hide" : "Show"} ${label}`}
      className="rounded p-1 text-[#B5B0CA] transition hover:text-[#6C4CD8]"
    >
      {shown ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

/** Rough strength signal — guidance only, the server enforces the real rule. */
function PasswordMeter({ value }: { value: string }) {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const level = Math.min(score, 4);
  const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = [
    "bg-rose-400",
    "bg-amber-400",
    "bg-yellow-400",
    "bg-emerald-400",
    "bg-emerald-500",
  ];

  return (
    <div className="-mt-2 flex items-center gap-3">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= level ? colors[level] : "bg-[#EDEBF3]"
            )}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium text-[#9B94B4]">
        {labels[level]}
      </span>
    </div>
  );
}
