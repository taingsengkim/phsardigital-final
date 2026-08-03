import Image from "next/image";
import Link from "next/link";
import { Star, Shield, Sparkles, Users } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   HOW TO ADD YOUR OWN picture PHOTOS
   1. Create the folder  /public/picture/
   2. Drop your photos in — name them like:  chan-chhaya.jpg
   3. Set  USE_LOCAL_PHOTOS = true  below
   ───────────────────────────────────────────────────────────────────────── */
const USE_LOCAL_PHOTOS = false; // ← flip to true after adding /public/picture/ photos

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
    local: "/picture/chan-chhaya.jpg",
    remote: "/picture/Mentor_1.jpg",
  },
  {
    name: "Mom Reaksmey",
    role: "Next.js, Project Management",
    local: "/picture/mom-reaksmey.jpg",
    remote: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80",
  },
  {
    name: "Eung Lyzhai",
    role: "UX/UI Design",
    local: "/picture/eung-lyzhai.jpg",
    remote: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80",
  },
];

const picture = [
  { name: "Pring Sovanvatey", role: "UX/UI design,Frontend developer", local: "/picture/pring-sovanvatey.jpg", remote: "/picture/vatey.jpg" },
  { name: "Taing Sengkim",    role: "Backend developer", local: "/t/taing-sengkim.jpg",          remote: "/picture/sengkim.jpg" },
  { name: "Sarun Lisa",       role: "UX/UI design , Frontend developer", local: "/picture/sarun-lisa.jpg",       remote: "/picture/lisa.png" },
  { name: "Lor Vengroth",     role: "Backend developer", local: "/picture/lor-vengroth.jpg",     remote: "/picture/vengroth.jpg" },
  { name: "Sim Menghor",      role: "UX/UI design,Frontend developer", local: "/picture/sim-menghor.jpg",      remote: "/picture/menghor.jpg" },
  { name: "Heang Bunleang",   role: "UX/UI design ,Frontend developer", local: "/picture/heang-bunleang.jpg",   remote: "/picture/bunleang.jpg" },
  { name: "Pheap Koemlay",    role: "UX/UI design ,Frontend developer", local: "/picture/pheap-koemlay.jpg",    remote: "/picture/koemlay.jpg" },
  { name: "En Sokhim",        role: "UX/UI design", local: "/picture/en-sokhim.jpg",        remote: "/picture/sokhim.jpg" },
];

type ValueVariant = "dark" | "lime" | "light" | "light2";
const CORE_VALUES: { title: string; body: string; Icon: React.ElementType; variant: ValueVariant }[] = [
  {
    title: "Excellence First",
    body: "We set the highest standards for our platform, ensuring that every interaction, from browsing to checkout, is flawless and world-class.",
    Icon: Star,
    variant: "dark",
  },
  {
    title: "Community Driven",
    body: "Building bridges between local Cambodian brands and the global digital economy.",
    Icon: Users,
    variant: "lime",
  },
  {
    title: "Unwavering Trust",
    body: "Security and transparency are at the core of everything we build, protecting both our merchants and customers.",
    Icon: Shield,
    variant: "light",
  },
  {
    title: "Innovation Daily",
    body: "We are constantly evolving, integrating the latest AI and fintech solutions to keep Phsar Digital at the cutting edge of retail technology.",
    Icon: Sparkles,
    variant: "light2",
  },
];

const VALUE_BG:   Record<ValueVariant, string> = { dark: "#3A1D9E", lime: "#B7E84A", light: "#EDEBF3", light2: "#EDEBF3" };
const VALUE_FG:   Record<ValueVariant, string> = { dark: "#fff",    lime: "#1A1330", light: "#1A1330", light2: "#1A1330" };
const VALUE_SUB:  Record<ValueVariant, string> = { dark: "rgba(255,255,255,0.78)", lime: "#3A3A1A", light: "#5A5470", light2: "#5A5470" };
const VALUE_ICON: Record<ValueVariant, string> = { dark: "#C4AFFE", lime: "#3A1D9E", light: "#6C4CD8", light2: "#6C4CD8" };

export default function AboutPage() {
  return (
    <div className="bg-white text-[#241F35]">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[320px] overflow-hidden">
        {/* bg photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1580913428023-02c429014349?w=1400&q=80)" }}
        />
        {/* white-to-transparent overlay */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.97) 30%, rgba(255,255,255,0.55) 65%, rgba(255,255,255,0.12))" }}
        />

        <div className="relative mx-auto max-w-[1240px] px-6 py-14">
          <span className="mb-3 inline-block rounded-[5px] bg-[#1A1330] px-3 py-1 text-[11px] font-bold tracking-[0.6px] text-white">
            ESTABLISHED 2024
          </span>
          <h1 className="mb-3 max-w-[560px] text-[38px] font-extrabold leading-[1.2] text-[#1A1330]">
            Empowering Digital Commerce in Cambodia
          </h1>
          <p className="mb-6 max-w-[460px] text-[15px] leading-[1.6] text-[#3F3A52]">
            Phsar Digital is more than a marketplace; we are a community-driven
            platform connecting brands and customers through seamless technology
            and human-centric design.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/register"
              className="rounded-lg bg-[#6C4CD8] px-[22px] py-3 text-[14px] font-semibold text-white transition hover:bg-[#5B3DC0]"
            >
              Join Our Journey
            </Link>
            <Link
              href="/products"
              className="rounded-lg border-[1.5px] border-[#6C4CD8] px-[22px] py-3 text-[14px] font-semibold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white"
            >
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════════════ */}
      <section className="border-b border-[#F0EEF8]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap justify-around gap-6 px-6 py-10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[30px] font-extrabold text-[#6C4CD8]">{s.value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.5px] text-[#8B85A0]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MENTORS ═══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1240px] px-6 py-10">
        <h2 className="mb-1.5 text-[24px] font-bold">Our Mentors</h2>
        <p className="mb-7 max-w-[560px] text-[14px] leading-relaxed text-[#6B6580]">
          Guided by industry leaders who bring decades of experience in
          e-commerce, digital transformation, and business strategy.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {MENTORS.map((m) => (
            <div
              key={m.name}
              className="group rounded-2xl bg-[#F1EFFA] px-6 py-8 text-center transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(36,31,53,0.12)]"
            >
              <div className="relative mx-auto mb-4 h-[88px] w-[88px] overflow-hidden rounded-full border-[3px] border-white shadow">
                <Photo person={m} />
              </div>
              <p className="text-[15px] font-bold text-[#241F35]">{m.name}</p>
              <p className="mt-1 text-[12px] text-[#6B6580]">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ picture ══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1240px] px-6 pb-14">
        <h2 className="mb-1.5 text-center text-[22px] font-bold">The Phsar Digital picture</h2>
        <p className="mx-auto mb-8 max-w-[520px] text-center text-[14px] leading-relaxed text-[#6B6580]">
          Our diverse picture of engineers, designers, and specialists are dedicated
          to building the future of commerce in Cambodia.
        </p>

        <div className="grid grid-cols-2 gap-[18px] sm:grid-cols-3 md:grid-cols-4">
          {picture.map((t) => (
            <div
              key={t.name}
              className="group overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(36,31,53,0.08)] transition-all hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(36,31,53,0.12)]"
            >
              {/* photo */}
              <div className="relative h-[130px] w-full overflow-hidden bg-[#EDEBF3]">
                <Photo person={t} />
              </div>
              {/* info */}
              <div className="px-3 py-3">
                <p className="text-[13px] font-bold text-[#241F35]">{t.name}</p>
                <p className="mt-[3px] text-[11px] leading-snug text-[#8B85A0]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CORE VALUES ═══════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1240px] px-6 pb-14">
        <h2 className="mb-6 text-center text-[22px] font-bold">Our Core Values</h2>

        {/*
          Bento grid — matches the reference exactly:
          col 1 row 1: dark (spans 2 rows — tall)
          col 2 row 1: lime
          col 1 row 2: light  ← note: reference puts light here
          col 2 row 2: light2
        */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gridTemplateRows: "auto auto",
            gap: 16,
          }}
        >
          {CORE_VALUES.map((v, i) => {
            const Icon = v.Icon;
            const gridStyle: React.CSSProperties =
              i === 0 ? { gridColumn: 1, gridRow: "1 / 3" }
              : i === 1 ? { gridColumn: 2, gridRow: 1 }
              : i === 2 ? { gridColumn: 1, gridRow: 2 }   // won't show — col1/row2 is covered by span
              : { gridColumn: 2, gridRow: 2 };

            // value 2 (Unwavering Trust) should be col2/row1 area but reference puts it
            // col1 row2 — since col1 is spanned, skip index 2 from col 1
            const adjustedGrid: React.CSSProperties =
              i === 0 ? { gridColumn: 1, gridRow: "1 / 3" }
              : i === 1 ? { gridColumn: 2, gridRow: 1 }
              : i === 2 ? { gridColumn: 2, gridRow: 2 }
              : {}; // index 3 hidden (only 3 cells in 2×2 with a span)

            if (i === 3) return null; // 4th card replaced by the tall card spanning

            return (
              <div
                key={v.title}
                style={{
                  ...adjustedGrid,
                  background: VALUE_BG[v.variant],
                  borderRadius: 14,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  minHeight: i === 0 ? 280 : 150,
                }}
              >
                <Icon size={20} color={VALUE_ICON[v.variant]} style={{ marginBottom: 10 }} />
                <p style={{ fontWeight: 700, fontSize: 15, color: VALUE_FG[v.variant], margin: 0 }}>
                  {v.title}
                </p>
                <p style={{ fontSize: 12.5, color: VALUE_SUB[v.variant], marginTop: 6, lineHeight: 1.5 }}>
                  {v.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ MISSION STRIP ═════════════════════════════════════════════════ */}
      <section className="bg-[#6C4CD8] py-14">
        <div className="mx-auto max-w-[680px] px-6 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#C4AFFE]">
            Our Mission
          </p>
          <h2 className="mb-5 text-[28px] font-extrabold leading-snug text-white">
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

/* ── Photo helper ─────────────────────────────────────────────────────────
   Uses local /public/picture/ photo when USE_LOCAL_PHOTOS is true,
   otherwise shows the Unsplash placeholder.
   ───────────────────────────────────────────────────────────────────────── */
type PersonPhoto = { name: string; local: string; remote: string };

function Photo({ person }: { person: PersonPhoto }) {
  const src = USE_LOCAL_PHOTOS ? person.local : person.remote;
  return (
    <Image
      src={src}
      alt={person.name}
      fill
      sizes="(max-width:640px) 50vw, 200px"
      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
      unoptimized={src.startsWith("http")}
    />
  );
}
