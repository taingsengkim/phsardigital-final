import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 pt-4">
      {/* breadcrumb */}
      <nav className="mb-3 flex items-center gap-1 text-[11px] text-[#8B85A0]">
        <Link href="/home" className="transition-colors hover:text-[#6C4CD8]">
          Home
        </Link>
        <ChevronRight size={10} />
        <span>Clearance Deals</span>
      </nav>

      {/* hero — purple gradient left, photo right */}
      <div className="flex min-h-[220px] overflow-hidden rounded-2xl shadow-sm">
        {/* text */}
        <div
          className="flex flex-col justify-center px-10 py-10"
          style={{
            flex: "0 0 46%",
            background: "linear-gradient(135deg, #7C5CFC 0%, #5B3DC8 100%)",
          }}
        >
          <p className="mb-3 text-[30px] font-extrabold leading-tight text-white">
            New Arrivals
          </p>
          <p className="max-w-[280px] text-[13px] leading-relaxed text-white/85">
            Stay organized and stylish with this premium-quality bag. Designed
            for comfort and durability, it offers ample storage space while
            complementing your everyday look. Perfect for work, school, travel,
            or casual outings.
          </p>
          <Link
            href="/category/bag-and-accessories"
            className="mt-6 self-start rounded-lg border-2 border-white bg-transparent px-6 py-2 text-[13px] font-bold text-white transition hover:bg-white hover:text-[#6C4CD8]"
          >
            Shop Now
          </Link>
        </div>

        {/* photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div
          className="flex-1 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80)",
          }}
          role="img"
          aria-label="New arrivals — premium bag collection"
        />
      </div>
    </div>
  );
}
