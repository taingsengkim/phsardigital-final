"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";

const BRAND      = "#6C4CD8";
const BRAND_DARK = "#1A1330";
const BRAND_MID  = "#8267E8";

export default function RegisterPage() {
  const [fullName,         setFullName]         = useState("");
  const [email,            setEmail]             = useState("");
  const [password,         setPassword]          = useState("");
  const [confirmPassword,  setConfirmPassword]   = useState("");
  const [showPassword,     setShowPassword]      = useState(false);
  const [showConfirm,      setShowConfirm]       = useState(false);
  const [agreed,           setAgreed]            = useState(false);
  const [submitting,       setSubmitting]        = useState(false);
  const [error,            setError]             = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!email.trim())    return setError("Please enter your email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!agreed) return setError("You must agree to the Terms of Service.");
    setSubmitting(true);
    try {
      // TODO: replace with real registration call
      await new Promise((r) => setTimeout(r, 700));
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh", display: "flex",
        fontFamily: "'Inter', sans-serif", fontSize: 17,
        background: "#fff",
      }}
    >
      {/* left panel */}
      <div className="hidden lg:flex" style={{ flex: "0 0 46%" }}>
        <AuthLeftPanel
          headline={
            <>
              Your digital marketplace
              <br />
              <span style={{ color: "#B9A6F2" }}>journey begins here.</span>
            </>
          }
          sub="Access a curated ecosystem of premium vendors and seamless financial transactions. Join thousands of shoppers who prioritize security and quality."
        />
      </div>

      {/* right panel */}
      <div
        style={{
          flex: 1, display: "flex", alignItems: "center",
          justifyContent: "center",
          background: "#F5F3F7", padding: "48px 24px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%", maxWidth: 480,
            background: "#fff", borderRadius: 18,
            padding: "40px 40px",
            boxShadow: "0 1px 4px rgba(26,19,48,0.08)",
          }}
          noValidate
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#1A1330", margin: "0 0 6px" }}>
            Create Account
          </h2>
          <p style={{ fontSize: 16, color: "#6B6580", margin: "0 0 22px" }}>
            Join our multi-vendor ecosystem as a buyer.
          </p>

          {/* buyer role notice */}
          <div
            style={{
              display: "flex", gap: 12,
              background: "#F5F4F9", borderRadius: 10,
              padding: "14px 16px", marginBottom: 24,
            }}
          >
            <Info size={18} color={BRAND} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#3B2A85", margin: 0 }}>
                Buyer Role Active
              </p>
              <p style={{ fontSize: 13, color: "#6B6580", margin: "3px 0 0", lineHeight: 1.5 }}>
                By default, you are registering as a buyer. You can explore and purchase from any vendor instantly.
              </p>
            </div>
          </div>

          {/* full name */}
          <Field label="Full Name" htmlFor="fullName">
            <IconInput
              id="fullName"
              icon={<User size={17} color="#A7A2B8" />}
              value={fullName}
              onChange={setFullName}
              placeholder="John Doe"
              autoComplete="name"
            />
          </Field>

          {/* email */}
          <Field label="Email Address" htmlFor="email">
            <IconInput
              id="email"
              icon={<Mail size={17} color="#A7A2B8" />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="john@example.com"
              autoComplete="email"
            />
          </Field>

          {/* password row */}
          <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <div style={{ position: "relative", marginTop: 7 }}>
                <span style={iconWrap}><Lock size={16} color="#A7A2B8" /></span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={inputStyle}
                />
                <EyeToggle show={showPassword} onToggle={() => setShowPassword((s) => !s)} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
              <div style={{ position: "relative", marginTop: 7 }}>
                <span style={iconWrap}><Lock size={16} color="#A7A2B8" /></span>
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={inputStyle}
                />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />
              </div>
            </div>
          </div>

          {/* terms */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 22, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: BRAND }}
            />
            <span style={{ fontSize: 14, color: "#3F3A52", lineHeight: 1.5 }}>
              I agree to the{" "}
              <Link href="/terms" style={{ color: BRAND, textDecoration: "none", fontWeight: 600 }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" style={{ color: BRAND, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</Link>.
            </span>
          </label>

          {error && (
            <p style={{ fontSize: 13, color: "#E53E3E", marginBottom: 16 }}>{error}</p>
          )}

          {/* submit */}
          <button
            type="submit"
            disabled={!agreed || submitting}
            style={{
              width: "100%", padding: "15px 0",
              borderRadius: 10, border: "none",
              background: agreed && !submitting ? BRAND_DARK : "#C7C2D6",
              color: "#fff", fontSize: 16, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              cursor: agreed && !submitting ? "pointer" : "not-allowed",
              transition: "background .15s",
            }}
          >
            {submitting ? "Creating account…" : "Create Account"}
            {!submitting && <ArrowRight size={17} />}
          </button>

          {/* divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E5E2EC" }} />
            <span style={{ fontSize: 12, color: "#A7A2B8", fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#E5E2EC" }} />
          </div>

          {/* sign in box */}
          <div
            style={{
              border: "1px dashed #D9D4E8", borderRadius: 10,
              padding: "22px 20px", textAlign: "center",
            }}
          >
            <p style={{ fontSize: 15, color: "#3F3A52", margin: "0 0 14px" }}>
              Already have an account?
            </p>
            <Link
              href="/auth/login"
              style={{
                display: "inline-block",
                background: BRAND_MID, color: "#fff",
                borderRadius: 8, padding: "10px 28px",
                fontSize: 14, fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign in Now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── shared sub-components ──────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: "#1A1330", display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 42px 13px 42px",
  borderRadius: 9,
  border: "1px solid #E2DFEC",
  background: "#FAFAFC",
  fontSize: 15,
  color: "#1A1330",
  outline: "none",
};

const iconWrap: React.CSSProperties = {
  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none",
};

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer", color: "#A7A2B8",
        display: "flex", padding: 0,
      }}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label htmlFor={htmlFor} style={labelStyle}>{label}</label>
      <div style={{ marginTop: 7 }}>{children}</div>
    </div>
  );
}

function IconInput({
  id, icon, type = "text", value, onChange, placeholder, autoComplete,
}: {
  id: string; icon: React.ReactNode; type?: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <span style={iconWrap}>{icon}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ ...inputStyle, padding: "13px 14px 13px 42px" }}
      />
    </div>
  );
}
