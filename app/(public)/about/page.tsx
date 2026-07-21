import Image from "next/image";
import Link from "next/link";
import {
  Star, Shield, Sparkles, Users,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   DATA
   ─────────────────────────────────────────────────────────────────────────
   HOW TO USE YOUR OWN PHOTOS
   ─────────────────────────────────────────────────────────────────────────
   1. Create  /public/team/  folder
   2. Drop your photos in there (e.g. chan-chhaya.jpg, sarun-lisa.jpg …)
   3. Replace the `img` values below with  "/team/your-filename.jpg"
   ───────────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "50k+",  label: "Active Users"    },
  { value: "1.2k+", label: "Verified Brands" },
  { value: "24/7",  label: "Expert Support"  },
  { value: "100%",  label: "Local Focus"     },
];

const MENTORS = [
  {
    name: "Chan Chhaya",
    role: "SpringBoot, Keycloak, Postman",
    img: "/team/chan-chhaya.jpg",          // ← replace with your photo
    fallback: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
  },
  {
    name: "Mom Reaksmey",
    role: "Next.js, Project Management",
    img: "/team/mom-reaksmey.jpg",
    fallback: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
  },
  {
    name: "Eung Lyzhai",
    role: "UX/UI Design",
    img: "/team/eung-lyzhai.jpg",
    fallback: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  },
];

const TEAM = [
  {
    name: "Pring Sovanvatey",
    role: "UX/UI Design & Frontend Developer",
    img: "/team/pring-sovanvatey.jpg",
    fallback: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
  },
  {
    name: "Taing Sengkim",
    role: "Backend Developer",
    img: "/team/taing-sengkim.jpg",
    fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
  },
  {
    name: "Sarun Lisa",
    role: "UX/UI Design & Frontend Developer",
    img: "/team/sarun-lisa.jpg",
    fallback: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80",
  },
  {
    name: "Lor Vengroth",
    role: "UX/UI Design & Backend Developer",
    img: "/team/lor-vengroth.jpg",
    fallback: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80",
  },
  {
    name: "Sim Menghor",
    role: "UX/UI Design & Frontend Developer",
    img: "/team/sim-menghor.jpg",
    fallback: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=300&q=80",
  },
  {
    name: "Heang Bunleang",
    role: "UX/UI Design & Frontend Developer",
    img: "/team/heang-bunleang.jpg",
    fallback: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80",
  },
  {
    name: "Pheap Koemlay",
    role: "UX/UI Design & Frontend Developer",
    img: "/team/pheap-koemlay.jpg",
    fallback: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80",
  },
  {
    name: "En Sokhim",
    role: "UX/UI Design",
    img: "/team/en-sokhim.jpg",
    fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
  },
];

const CORE_VALUES = [
  {
    title: "Excellence First",
    body: "We set the highest standards for our platform, ensuring every interaction — from browsing to checkout — is flawless and world-class.",
    Icon: Star,
    variant: "dark" as const,
  },
  {
    title: "Community Driven",
    body: "Building bridges between local Cambodian brands and the global digital economy.",
    Icon: Users,
    variant: "lime" as const,
  },
  {
    title: "Unwavering Trust",
    body: "Security and transparency are at the core of everything we build, protecting both merchants and customers.",
    Icon: Shield,
    variant: "light" as const,
  },
  {
    title: "Innovation Daily",
    body: "We constantly evolve, integrating the latest AI and fintech solutions to keep Phsar Digital at the cutting edge of retail technology.",
    Icon: Sparkles,
    variant: "purple" as const,
  },
];

const VALUE_STYLES = {
  dark:   { bg: "#1A1330", text: "#fff",     sub: "rgba(255,255,255,0.75)", iconColor: "#C4AFFE" },
  lime:   { bg: "#C6F135", text: "#1A1330",  sub: "#3A3A1A",               iconColor: "#3A1D9E" },
  light:  { bg: "#EDEBF3", text: "#1A1330",  sub: "#5A5470",               iconColor: "#6C4CD8" },
  purple: { bg: "#6C4CD8", text: "#fff",     sub: "rgba(255,255,255,0.80)", iconColor: "#C4AFFE" },
};

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="bg-white font-sans text-[#241F35]">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[340px] overflow-hidden">
        {/* background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1580913428023-02c429014349?w=1400&q=80)",
          }}
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/20" />

        <div className="relative mx-auto max-w-[1240px] px-6 py-14">
          <span className="mb-4 inline-block rounded-md bg-[#1A1330] px-3 py-1 text-[11px] font-bold tracking-wide text-white">
            ESTABLISHED 2024
          </span>
          <h1 className="mb-4 max-w-[540px] text-[36px] font-extrabold leading-[1.18] text-[#1A1330]">
            Empowering Digital Commerce<br />in Cambodia
          </h1>
          <p className="mb-7 max-w-[440px] text-[14px] leading-relaxed text-[#3F3A52]">
            Phsar Digital is more than a marketplace; we are a community-driven
            platform connecting brands and customers through seamless technology
            and human-centric design.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/register"
              className="rounded-lg bg-[#6C4CD8] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#5C3DC8]"
            >
              Join Our Journey
            </Link>
            <Link
              href="/products"
              className="rounded-lg border-2 border-[#6C4CD8] bg-transparent px-5 py-3 text-[14px] font-semibold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white"
            >
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#F0EEF8]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap justify-around gap-6 px-6 py-10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[32px] font-extrabold text-[#6C4CD8]">{s.value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#8B85A0]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MENTORS ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-6 py-12">
        <h2 className="mb-1 text-[22px] font-bold">Our Mentors</h2>
        <p className="mb-8 max-w-[500px] text-[13px] text-[#6B6580]">
          Guided by industry leaders who bring decades of experience in
          e-commerce, digital transformation, and business strategy.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {MENTORS.map((m) => (
            <div
              key={m.name}
              className="group rounded-2xl bg-[#F1EFFA] px-6 py-8 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative mx-auto mb-4 h-[90px] w-[90px] overflow-hidden rounded-full border-[3px] border-white shadow-sm">
                <FallbackImage src={m.img} fallback={m.fallback} alt={m.name} />
              </div>
              <p className="text-[15px] font-bold text-[#1A1330]">{m.name}</p>
              <p className="mt-1 text-[12px] text-[#6B6580]">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-6 pb-14">
        <h2 className="mb-1 text-center text-[22px] font-bold">
          The Phsar Digital Team
        </h2>
        <p className="mx-auto mb-8 max-w-[480px] text-center text-[13px] text-[#6B6580]">
          Our diverse team of engineers, designers, and specialists are dedicated
          to building the future of commerce in Cambodia.
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {TEAM.map((t) => (
            <div
              key={t.name}
              className="group overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(36,31,53,0.10)] transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* photo */}
              <div className="relative h-[160px] w-full overflow-hidden bg-[#EDEBF3]">
                <FallbackImage src={t.img} fallback={t.fallback} alt={t.name} />
              </div>
              {/* info */}
              <div className="px-3 py-3.5">
                <p className="text-[13px] font-bold text-[#1A1330]">{t.name}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#8B85A0]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CORE VALUES ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-6 pb-16">
        <h2 className="mb-8 text-center text-[22px] font-bold">Our Core Values</h2>

        {/* 2×2 bento grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          {CORE_VALUES.map((v, i) => {
            const style = VALUE_STYLES[v.variant];
            const Icon  = v.Icon;
            /* first card spans full height on the left */
            const spanClass = i === 0 ? "row-span-2" : "";
            return (
              <div
                key={v.title}
                className={`${spanClass} flex flex-col justify-end rounded-2xl p-6`}
                style={{ background: style.bg, minHeight: i === 0 ? 280 : 130 }}
              >
                <Icon size={22} color={style.iconColor} className="mb-3" />
                <p className="text-[15px] font-bold" style={{ color: style.text }}>
                  {v.title}
                </p>
                <p
                  className="mt-2 text-[12.5px] leading-relaxed"
                  style={{ color: style.sub }}
                >
                  {v.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── MISSION STRIP ────────────────────────────────────────────────── */}
      <section className="bg-[#6C4CD8] py-14">
        <div className="mx-auto max-w-[720px] px-6 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#C4AFFE]">
            Our Mission
          </p>
          <h2 className="mb-5 text-[28px] font-extrabold leading-tight text-white">
            To make digital commerce accessible, trustworthy, and human.
          </h2>
          <p className="text-[14px] leading-relaxed text-white/80">
            We believe every Cambodian entrepreneur deserves a world-class platform
            to reach customers near and far — and every shopper deserves a secure,
            delightful experience. That belief drives every line of code we write.
          </p>
        </div>
      </section>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FallbackImage — tries the local /public/team/ path first,
   falls back to the Unsplash URL when the local file doesn't exist yet.
   ───────────────────────────────────────────────────────────────────────── */
function FallbackImage({
  src,
  fallback,
  alt,
}: {
  src: string;
  fallback: string;
  alt: string;
}) {
  // We use the Unsplash URL as the actual src until you drop real photos in.
  // Once you add /public/team/filename.jpg, swap `useSrc` to `src`.
  const useSrc = fallback; // ← change to `src` after adding your photos

  return (
    <Image
      src={useSrc}
      alt={alt}
      fill
      sizes="(max-width:640px) 50vw, 200px"
      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
      unoptimized={useSrc.startsWith("http")}
    />
  );
}
