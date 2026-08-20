"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronsUpDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  badge: string;
  title: string;
  highlight: string;
  price: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
  image: string;
  bg: string;
  tag: string;
  /** where the focal point of the photo sits */
  imgPosition: string;
};

const SLIDES: Slide[] = [
  {
    badge: "Flash Sale",
    title: "Best Bag",
    highlight: "Collection",
    price: "$79",
    description:
      "Premium-quality bags designed for comfort and durability. Shop the latest styles from top local sellers.",
    ctaHref: "/category/bag-and-accessories",
    ctaLabel: "Shop Now",
    image: "/picture/pic1.jpg",
    bg: "from-[#1A1330] via-[#2D1F5E] to-[#3B2A80]",
    tag: "Up to 40% OFF",
    imgPosition: "center center",   // iPhones centred
  },
  {
    badge: "New Season",
    title: "Fashion",
    highlight: "Essentials",
    price: "$29",
    description:
      "Curated pieces from Cambodian sellers — perfect for work, school, travel, or casual outings.",
    ctaHref: "/category/fashion-and-beauty",
    ctaLabel: "Explore Now",
    image: "/picture/pic4.jpg",
    bg: "from-[#0F0A2A] via-[#2D1F5E] to-[#3B2A80]",
    tag: "New Arrivals",
    imgPosition: "center 25%",      // watch — keep wrist/bracelet area in frame
  },
  {
    badge: "Limited Offer",
    title: "Tech &",
    highlight: "Accessories",
    price: "$49",
    description:
      "Laptops, phones, and accessories from verified vendors across the Phsar Digital marketplace.",
    ctaHref: "/category/computer-and-accessories",
    ctaLabel: "Browse Deals",
    image: "/picture/pic7.jpg",
    bg: "from-[#0F0A2A] via-[#1E1450] to-[#3B2A80]",
    tag: "Best Sellers",
    imgPosition: "center top",      // fashion top — show from collar down
  },
];

const AUTOPLAY_DELAY = 4500;

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number, dir: "next" | "prev" = "next") => {
      if (transitioning) return;
      const target = (next + SLIDES.length) % SLIDES.length;
      setDirection(dir);
      setPrev(current);
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(target);
        setPrev(null);
        setTransitioning(false);
      }, 500);
    },
    [current, transitioning]
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => goTo(current + 1, "next"), AUTOPLAY_DELAY);
    return () => clearInterval(id);
  }, [current, paused, goTo]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── full-width gradient background that transitions ── */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r transition-all duration-700",
          slide.bg
        )}
      />

      {/* subtle dot-grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── content ── */}
      <div className="relative mx-auto grid min-h-[520px] max-w-[1280px] grid-cols-1 items-center gap-0 px-6 md:grid-cols-2 lg:min-h-[560px] lg:px-16">

        {/* ── LEFT TEXT ── */}
        <div
          key={`text-${current}`}
          className={cn(
            "flex flex-col py-14 pr-0 md:pr-8",
            "animate-in fade-in slide-in-from-left-8 duration-500"
          )}
        >
          {/* badge row */}
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              {slide.badge}
            </span>
            <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-bold uppercase text-[#1A1330]">
              {slide.tag}
            </span>
          </div>

          {/* headline */}
          <h1 className="text-[52px] font-black leading-[1.05] tracking-tight text-white sm:text-[64px] lg:text-[72px]">
            {slide.title}
            <br />
            <span className="text-yellow-300">{slide.highlight}</span>
          </h1>

          {/* price chip */}
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-[15px] font-medium text-white/60">Starting from</span>
            <span className="text-[38px] font-black text-yellow-300 leading-none">{slide.price}</span>
          </div>

          {/* description */}
          <p className="mt-4 max-w-[380px] text-[15px] leading-relaxed text-white/70">
            {slide.description}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={slide.ctaHref}
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-[#6C4CD8] shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all hover:scale-105 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
            >
              {slide.ctaLabel}
              <ArrowUpDown
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              View All
            </Link>
          </div>

          {/* slide dots */}
          <div className="mt-10 flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? "next" : "prev")}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "h-2.5 w-10 bg-yellow-300"
                    : "h-2.5 w-2.5 bg-white/30 hover:bg-white/60"
                )}
              />
            ))}
            {/* progress bar */}
            {!paused && (
              <div className="ml-3 h-0.5 w-16 overflow-hidden rounded-full bg-white/20">
                <div
                  key={current}
                  className="h-full rounded-full bg-white/60"
                  style={{
                    animation: `progressBar ${AUTOPLAY_DELAY}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT IMAGE ── */}
        <div
          key={`img-${current}`}
          className="relative flex items-center justify-center py-10 animate-in fade-in slide-in-from-right-8 duration-500 md:py-12"
        >
          {/* soft glow behind the card */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          </div>

          {/* PHOTO CARD — tall, rounded, cover-fit */}
          <div className="relative z-10 h-[400px] w-[300px] overflow-hidden rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10 sm:h-[440px] sm:w-[340px] lg:h-[480px] lg:w-[380px]">
            <Image
              key={slide.image}
              src={slide.image}
              alt={slide.title}
              fill
              className="transition-opacity duration-500"
              style={{
                objectFit: "cover",
                objectPosition: slide.imgPosition,
              }}
              priority
            />
            {/* bottom fade so card blends into the dark bg */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />

            {/* price chip inside the card */}
            <div className="absolute bottom-5 left-5 rounded-xl bg-black/50 px-4 py-2 backdrop-blur-md">
              <p className="text-[10px] font-semibold text-white/50">Starting from</p>
              <p className="text-xl font-black leading-none text-yellow-300">{slide.price}</p>
            </div>
          </div>

          {/* floating rating card — bottom right of card */}
          <div className="absolute bottom-14 right-4 hidden rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md lg:block">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="ml-1 text-xs font-bold text-white">4.9</span>
            </div>
            <p className="mt-0.5 text-[11px] text-white/60">2,400+ reviews</p>
          </div>

          {/* floating customers card — top left of card */}
          <div className="absolute left-4 top-14 hidden rounded-2xl bg-white/15 p-4 backdrop-blur-md lg:block">
            <p className="text-xs font-semibold text-white/60">Happy Customers</p>
            <p className="mt-0.5 text-2xl font-black text-white">12k+</p>
            <div className="mt-2 flex -space-x-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-7 w-7 rounded-full border-2 border-white/30 bg-gradient-to-br from-purple-300 to-purple-600"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── prev / next arrow buttons ── */}
      <button
        onClick={() => goTo(current - 1, "prev")}
        aria-label="Previous"
        className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 hover:scale-110"
      >
        <ChevronsUpDown size={20} />
      </button>
      <button
        onClick={() => goTo(current + 1, "next")}
        aria-label="Next"
        className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 hover:scale-110"
      >
        <ChevronsUpDown size={20} />
      </button>

      {/* progress bar keyframes */}
      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
