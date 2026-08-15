import Image from "next/image";
import Link from "next/link";
import { Star, Shield, Sparkles, Users } from "lucide-react";
import { getListings } from "@/app/api/listings";
import type { Listing } from "@/app/api/listings";
import AddToCartButton from "@/components/product/AddToCartButton";

/* ─────────────────────────────────────────────────────────────────────────
   Photos live at /public/picture/  (moved from app/(public)/picture/).
   Referenced below as plain "/picture/filename.ext" strings — no import
   needed, since anything in /public is served as-is from the site root.

   Only ONE mentor has a real photo right now (Mentor_1.jpg → Chan Chhaya).
   Mom Reaksmey and Eung Lyzhai fall back to a placeholder until you add
   their photos — see the `photo: null` entries below.
   ───────────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "50k+", label: "Active Users" },
  { value: "1.2k+", label: "Verified Brands" },
  { value: "24/7", label: "Expert Support" },
  { value: "100%", label: "Local Focus" },
];

const MENTORS = [
  { name: "Chan Chhaya", role: "SpringBoot, Keycloak, Postman", photo: "/picture/Mentor_1.jpg" },
  { name: "Mom Reaksmey", role: "Next.js, Project Management", photo: "/picture/Mentor_2.jpg" },
  { name: "Eung Lyzhai", role: "UX/UI Design", photo: "/picture/Mentor_3.jpg"},
];

const TEAM = [
  { name: "Pring Sovanvatey", role: "UX/UI design, Frontend developer", photo: "/picture/vatey.jpg" },
  { name: "Taing Sengkim", role: "Backend developer", photo: "/picture/sengkim.jpg" },
  { name: "Sarun Lisa", role: "UX/UI design, Frontend developer", photo: "/picture/lisa.PNG" },
  { name: "Lor Vengroth", role: "Backend developer", photo: "/picture/vengroth.png" },
  { name: "Sim Menghor", role: "UX/UI design, Frontend developer", photo: "/picture/menghor.jpg" },
  { name: "Heang Bunleang", role: "UX/UI design, Frontend developer", photo: "/picture/bunleang.jpg" },
  { name: "Pheap Koemlay", role: "UX/UI design, Frontend developer", photo: "/picture/koemlay.jpg" },
  { name: "En Sokhim", role: "UX/UI design", photo: "/picture/sokhim.JPG" },
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

const VALUE_BG: Record<ValueVariant, string> = { dark: "#3A1D9E", lime: "#B7E84A", light: "#EDEBF3", light2: "#EDEBF3" };
const VALUE_FG: Record<ValueVariant, string> = { dark: "#fff", lime: "#1A1330", light: "#1A1330", light2: "#1A1330" };
const VALUE_SUB: Record<ValueVariant, string> = { dark: "rgba(255,255,255,0.78)", lime: "#3A3A1A", light: "#5A5470", light2: "#5A5470" };
const VALUE_ICON: Record<ValueVariant, string> = { dark: "#C4AFFE", lime: "#3A1D9E", light: "#6C4CD8", light2: "#6C4CD8" };

export default async function AboutPage() {
  /* fetch up to 4 featured/active listings for the product showcase */
  let featuredListings: Listing[] = [];
  try {
    const data = await getListings({ status: "ACTIVE", pageSize: 4 });
    featuredListings = data.content.slice(0, 4);
  } catch {
    featuredListings = [];
  }
  return (
    <div className="bg-white text-[#241F35]">
      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[320px] overflow-hidden">
        <Image
          src="/picture/backgroud_aboutus.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
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
            Phsar Digital is more than a marketplace; we are a community-driven platform connecting brands and
            customers through seamless technology and human-centric design.
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
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.5px] text-[#8B85A0]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MENTORS ═══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1240px] px-6 py-10">
        <h2 className="mb-1.5 text-[24px] font-bold">Our Mentors</h2>
        <p className="mb-7 max-w-[560px] text-[14px] leading-relaxed text-[#6B6580]">
          Guided by industry leaders who bring decades of experience in e-commerce, digital transformation, and
          business strategy.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {MENTORS.map((m) => (
            <div
              key={m.name}
              className="group rounded-2xl bg-[#F1EFFA] px-6 py-8 text-center transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(36,31,53,0.12)]"
            >
              <div className="relative mx-auto mb-4 h-[88px] w-[88px] overflow-hidden rounded-full border-[3px] border-white bg-[#DED7F3] shadow">
                {m.photo ? (
                  <Image src={m.photo} alt={m.name} fill sizes="88px" className="object-cover object-top" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#6C4CD8]">
                    {m.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
              </div>
              <p className="text-[15px] font-bold text-[#241F35]">{m.name}</p>
              <p className="mt-1 text-[12px] text-[#6B6580]">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TEAM ══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1240px] px-6 pb-14">
        <h2 className="mb-1.5 text-center text-[22px] font-bold">The Phsar Digital Team</h2>
        <p className="mx-auto mb-10 max-w-[520px] text-center text-[14px] leading-relaxed text-[#6B6580]">
          Our diverse team of engineers, designers, and specialists are dedicated to building the future of
          commerce in Cambodia.
        </p>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {TEAM.map((t) => (
            <div
              key={t.name}
              className="group rounded-2xl border border-[#EEECF5] bg-white px-5 py-7 text-center shadow-[0_1px_3px_rgba(36,31,53,0.06)] transition-all hover:-translate-y-1 hover:border-[#DED3F7] hover:shadow-[0_14px_28px_rgba(108,76,216,0.14)]"
            >
              {/* circular photo, ring that lights up purple on hover */}
              <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-[#EDEBF3] ring-4 ring-white transition-all group-hover:ring-[#EDE8FB]">
                <Image
                  src={t.photo}
                  alt={t.name}
                  fill
                  sizes="96px"
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <p className="text-[14px] font-bold leading-snug text-[#241F35]">{t.name}</p>

              {/* role as a soft pill instead of plain gray text */}
              <span className="mt-2 inline-block rounded-full bg-[#F1EFFA] px-3 py-1 text-[10.5px] font-semibold leading-snug text-[#6C4CD8]">
                {t.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CORE VALUES ═══════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1240px] px-6 pb-14">
        <h2 className="mb-6 text-center text-[22px] font-bold">Our Core Values</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gridTemplateRows: "auto auto", gap: 16 }}>
          {CORE_VALUES.slice(0, 3).map((v, i) => {
            const Icon = v.Icon;
            const gridStyle: React.CSSProperties =
              i === 0 ? { gridColumn: 1, gridRow: "1 / 3" } : i === 1 ? { gridColumn: 2, gridRow: 1 } : { gridColumn: 2, gridRow: 2 };

            return (
              <div
                key={v.title}
                style={{
                  ...gridStyle,
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
                <p style={{ fontWeight: 700, fontSize: 15, color: VALUE_FG[v.variant], margin: 0 }}>{v.title}</p>
                <p style={{ fontSize: 12.5, color: VALUE_SUB[v.variant], marginTop: 6, lineHeight: 1.5 }}>{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ═════════════════════════════════════════ */}
      {featuredListings.length > 0 && (
        <section className="bg-[#F6F5FA] py-14">
          <div className="mx-auto max-w-[1240px] px-6">
            {/* heading */}
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[13px] font-bold uppercase tracking-widest text-[#6C4CD8]">
                  Marketplace Picks
                </p>
                <h2 className="mt-1 text-[26px] font-extrabold text-[#1A1330]">
                  Featured Products
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden rounded-xl border border-[#E2DFEC] bg-white px-5 py-2.5 text-[14px] font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA] sm:block"
              >
                View All →
              </Link>
            </div>

            {/* product cards grid — max 4 */}
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {featuredListings.map((listing) => {
                const imgSrc =
                  listing.images?.find((i) => i.isPrimary)?.uri ??
                  listing.images?.[0]?.uri ??
                  listing.thumbnailUri?.uri;

                return (
                  <article
                    key={listing.uuid}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(36,31,53,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.18)]"
                  >
                    {/* image */}
                    <Link href={`/products/${listing.slug}`}>
                      <div className="relative aspect-square w-full overflow-hidden bg-[#F5F3FA]">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={listing.title}
                            fill
                            sizes="(max-width:640px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                            unoptimized={imgSrc.startsWith("http://")}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#C4B5FD]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-12 w-12">
                              <rect x="3" y="3" width="18" height="18" rx="3" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </div>
                        )}

                        {/* featured badge */}
                        {listing.isFeatured && (
                          <span className="absolute left-3 top-3 rounded-lg bg-[#6C4CD8] px-2.5 py-1 text-[12px] font-bold text-white shadow-sm">
                            Featured
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* body */}
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <Link
                        href={`/products/${listing.slug}`}
                        className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#241F35] transition-colors hover:text-[#6C4CD8]"
                      >
                        {listing.title}
                      </Link>

                      {/* category */}
                      {listing.category && (
                        <span className="inline-flex w-fit rounded-full bg-[#F0EDFB] px-2.5 py-0.5 text-[11px] font-semibold text-[#6C4CD8]">
                          {listing.category.name}
                        </span>
                      )}

                      {/* stars */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} fill="#F5B301" color="#F5B301" />
                        ))}
                        {listing.sold > 0 && (
                          <span className="ml-1.5 text-[11px] text-[#8B85A0]">{listing.sold} sold</span>
                        )}
                      </div>

                      {/* price + add to cart */}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <span className="text-[18px] font-extrabold text-[#6C4CD8]">
                          ${listing.price.toFixed(2)}
                        </span>
                        <AddToCartButton listingUuid={listing.uuid} size="sm" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* mobile view all */}
            <div className="mt-6 flex justify-center sm:hidden">
              <Link
                href="/products"
                className="rounded-xl border border-[#E2DFEC] bg-white px-6 py-3 text-[14px] font-bold text-[#6C4CD8]"
              >
                View All Products →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ MISSION STRIP ═════════════════════════════════════════════════ */}
      <section className="bg-[#6C4CD8] py-14">
        <div className="mx-auto max-w-[680px] px-6 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#C4AFFE]">Our Mission</p>
          <h2 className="mb-5 text-[28px] font-extrabold leading-snug text-white">
            To make digital commerce accessible, trustworthy, and human.
          </h2>
          <p className="text-[14px] leading-relaxed text-white/80">
            We believe every Cambodian entrepreneur deserves a world-class platform to reach customers near and
            far — and every shopper deserves a secure, delightful experience. That belief drives every line of
            code we write.
          </p>
        </div>
      </section>
    </div>
  );
}