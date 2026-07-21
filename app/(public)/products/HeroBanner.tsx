import Link from "next/link";

const QUICK_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Clearance deals", href: "/products?sort=price_asc" },
  { label: "New Arrivals", href: "/products?sort=newest" },
];

// Placeholder preview cards shown on the right side of the hero
const PREVIEW_CARDS = [
  { rating: 992 },
  { rating: 992 },
  { rating: 992 },
];

export default function HeroBanner() {
  return (
    <div className="bg-muted/30 border-b">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">

          {/* ── left: text ── */}
          <div className="flex flex-1 flex-col justify-center space-y-5">
            {/* quick-link strip */}
            <nav
              className="flex items-center gap-0 text-sm text-muted-foreground flex-wrap"
              aria-label="Quick links"
            >
              {QUICK_LINKS.map((link, i) => (
                <span key={link.href} className="flex items-center">
                  {i > 0 && (
                    <span className="mx-2 select-none text-border">|</span>
                  )}
                  <Link
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>

            {/* copy */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Recommend
              </p>
              <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                Stay organized and stylish with this premium-quality bag.
                Designed for comfort and durability, it offers ample storage
                space while complementing your everyday look. Perfect for work,
                school, travel, or casual outings.
              </p>
            </div>
          </div>

          {/* ── right: 3 preview rating cards ── */}
          <div className="flex flex-shrink-0 flex-col gap-3 lg:w-72">
            {PREVIEW_CARDS.map((card, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm"
              >
                {/* image placeholder */}
                <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-muted" />
                {/* info */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {/* 5 filled stars */}
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg
                        key={s}
                        className="h-3 w-3 fill-yellow-400 text-yellow-400"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {card.rating.toLocaleString()} Ratings
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
