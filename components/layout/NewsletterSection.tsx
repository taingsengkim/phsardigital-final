import { Mail } from "lucide-react";

const BRAND  = "#6C4CD8";
const ACCENT = "#8FC93A";

export default function NewsletterSection() {
  return (
    <div style={{ background: "#EDEBF3" }}>
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "28px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {/* text */}
        <div>
          <h3
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 17, fontWeight: 700,
              margin: "0 0 4px", color: "#241F35",
            }}
          >
            Sign up for Phsar Digital&apos;s News &amp; Offers
          </h3>
          <p style={{ fontSize: 12, color: "#5A5470", margin: 0 }}>
            Be the first to know about Exclusive deals, New arrivals, and
            Marketplace insights!
          </p>
        </div>

        {/* input + button */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Mail
              size={14}
              color={BRAND}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="email"
              placeholder="Phsar.Digital@com.kh"
              aria-label="Email for newsletter"
              style={{
                padding: "10px 14px 10px 32px",
                borderRadius: 8,
                border: "1px solid #D9D4E8",
                fontSize: 13,
                minWidth: 220,
                outline: "none",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: ACCENT,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 600, fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
