type Props = {
  headline: React.ReactNode;
  sub: string;
  /** Extra content rendered above the copyright line */
  extra?: React.ReactNode;
};

export default function AuthLeftPanel({ headline, sub, extra }: Props) {
  return (
    <div
      style={{
        flex: "0 0 46%",
        position: "relative",
        background: "linear-gradient(160deg, #1E1150 0%, #3B1F8A 55%, #5B33B8 100%)",
        padding: "48px 56px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      {/* watermark circle */}
      <div
        style={{
          position: "absolute",
          top: 110, left: 36,
          width: 280, height: 280,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <svg width="130" height="130" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <rect x="10" y="12" width="14" height="14" rx="3" fill="rgba(255,255,255,0.12)" />
          <rect x="10" y="34" width="14" height="14" rx="3" fill="rgba(255,255,255,0.12)" />
          <rect x="32" y="34" width="14" height="14" rx="3" fill="rgba(255,255,255,0.12)" />
          <path d="M36 12 h32 a24 24 0 0 1 0 48 h-18 v36 h-14 v-84 z" fill="rgba(255,255,255,0.14)" />
        </svg>
      </div>

      {/* logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: 38, height: 38, borderRadius: 999,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="3" height="3" rx="0.7" fill="white" opacity="0.9" />
            <rect x="1" y="7" width="3" height="3" rx="0.7" fill="white" opacity="0.9" />
            <rect x="6" y="7" width="3" height="3" rx="0.7" fill="white" opacity="0.9" />
            <path d="M6 2h6a4 4 0 0 1 0 8h-3v6h-3V2z" fill="white" />
          </svg>
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Phsar Digital</span>
      </div>

      {/* headline */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1.25, margin: "0 0 16px" }}>
          {headline}
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: "rgba(255,255,255,0.80)", maxWidth: 400, margin: 0 }}>
          {sub}
        </p>
        {extra && <div style={{ marginTop: 28 }}>{extra}</div>}
      </div>

      {/* copyright */}
      <div style={{ position: "relative", zIndex: 1, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
        © Phsar Digital Marketplace Ecosystem
      </div>
    </div>
  );
}
