import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function HeroBanner() {
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "16px 24px 0" }}>
      {/* breadcrumb */}
      <div style={{ fontSize: 12, color: "#8B85A0", marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>
        <Link href="/home" style={{ color: "#8B85A0", textDecoration: "none" }}>Home</Link>
        <ChevronRight size={11} />
        <span>Clearance Deals</span>
      </div>

      {/* hero card */}
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          background: "linear-gradient(120deg, #E7E1FB, #B9A6F2)",
          display: "flex",
          minHeight: 190,
        }}
      >
        {/* text */}
        <div style={{ padding: "34px 40px", maxWidth: 420, zIndex: 1 }}>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 26, fontWeight: 700, color: "#fff",
              display: "block", marginBottom: 12,
            }}
          >
            New Arrivals
          </span>
          <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Stay organized and stylish with this premium-quality bag. Designed
            for comfort and durability, it offers ample storage space while
            complementing your everyday look. Perfect for work, school, travel,
            or casual outings.
          </p>
        </div>

        {/* image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div
          style={{
            flex: 1,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
          }}
          role="img"
          aria-label="Premium bag"
        />
      </div>
    </div>
  );
}
