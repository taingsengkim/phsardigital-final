import Link from "next/link";
import {
  Phone, Mail, User, MapPinned,
  Recycle, Headphones, Star,
} from "lucide-react";

const BRAND = "#6C4CD8";

const FOOTER_COLS = [
  {
    title: "Company",
    links: [
      "About Us", "Careers", "Press & Media",
      "Privacy Policy", "Terms & Conditions", "Acceptable Use Policy",
    ],
  },
  {
    title: "Make Money with Us",
    links: [
      "Sell product on Phsar Digital", "Sell on Amazon Business",
      "Merchant Portal", "Merchant Support", "Partner With Us", "Advertising",
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      "Help Center", "Community", "Brand Directory", "Customer Service",
      "Your Account", "Your Order", "Shipping Rates & Policies",
      "Returns & Replacements",
    ],
  },
];

const TRUST = [
  { icon: Recycle,     label: "100% Secure Checkout"            },
  { icon: Headphones,  label: "24/7 Dedicated Support"          },
  { icon: Star,        label: "Thousands of Genuine Reviews"    },
];

export default function Footer() {
  return (
    <footer>

      {/* ── 4-column links ── */}
      <div
        style={{
          maxWidth: 1240, margin: "0 auto",
          padding: "36px 24px 20px",
          display: "flex", gap: 48, flexWrap: "wrap",
        }}
      >
        {/* brand column */}
        <div style={{ minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 30, height: 30, borderRadius: 999,
                background: BRAND,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 13,
              }}
            >
              P
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, color: "#241F35" }}>
              Phsar Digital
            </span>
          </div>
        </div>

        {/* link columns */}
        {FOOTER_COLS.map((col) => (
          <div key={col.title} style={{ minWidth: 170 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#241F35" }}>
              {col.title}
            </h4>
            {col.links.map((l) => (
              <Link
                key={l}
                href="#"
                style={{
                  display: "block", color: "#5A5470",
                  fontSize: 13, marginBottom: 8, textDecoration: "none",
                }}
              >
                {l}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* ── trust badges ── */}
      <div style={{ borderTop: "1px solid #EDEBF3" }}>
        <div
          style={{
            maxWidth: 1240, margin: "0 auto",
            padding: "20px 24px",
            display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center",
          }}
        >
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, color: "#3A3350" }}>
              <Icon size={18} color={BRAND} />
              <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── contact bar ── */}
      <div style={{ borderTop: "1px solid #EDEBF3", padding: "20px 24px" }}>
        <div
          style={{
            maxWidth: 1240, margin: "0 auto",
            display: "flex", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
          }}
        >
          <Link href="/contact-us" style={{ color: BRAND, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            Start A Conversation
          </Link>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: "#5A5470" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Phone size={12} /> +012 ********
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={12} /> Phsar.Digital@com.kh
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <User size={12} /> Support ticket
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <MapPinned size={12} /> street 124, Toul Kork, Cambodia
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
}
