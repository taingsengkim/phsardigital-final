import LogoSvg from "@/assets/svg/logo";
import type { ReactNode } from "react";

type Props = {
  headline: ReactNode;
  sub: string;
  extra?: ReactNode;
};

export default function AuthLeftPanel({ headline, sub, extra }: Props) {
  return (
    <div className="relative hidden min-h-screen w-[46%] flex-shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1E1150] via-[#3B1F8A] to-[#6C4CD8] p-12 lg:flex">

      {/* ── decorative blobs ── */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute bottom-16 -left-20 h-72 w-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03]" />

      {/* ── logo ── */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          {/* real project logo mark, strokes inverted white */}
          <LogoSvg
            className="h-6 w-6"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
        <span className="text-[18px] font-bold tracking-tight text-white">
          Phsar Digital
        </span>
      </div>

      {/* ── main copy ── */}
      <div className="relative z-10 space-y-5">
        <h1 className="text-[38px] font-extrabold leading-[1.18] text-white">
          {headline}
        </h1>
        <p className="max-w-sm text-[16px] leading-[1.7] text-white/75">{sub}</p>
        {extra && <div className="pt-2">{extra}</div>}
      </div>

      {/* ── footer ── */}
      <p className="relative z-10 text-[12px] text-white/40">
        © {new Date().getFullYear()} Phsar Digital Marketplace
      </p>
    </div>
  );
}
