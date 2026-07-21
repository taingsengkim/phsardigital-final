import Link from "next/link";
import {
  ShieldCheckIcon,
  HeadphonesIcon,
  StarIcon,
  PhoneIcon,
  MapPinIcon,
  MailIcon,
  MessageSquareIcon,
} from "lucide-react";

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Press & Media", href: "/press" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Acceptable Use Policy", href: "/aup" },
];

const SELLER_LINKS = [
  { label: "Sell product on Phsar Digital", href: "/sell" },
  { label: "Sell on Amazon Business", href: "/sell/amazon" },
  { label: "Merchant Portal", href: "/merchant" },
  { label: "Merchant Support", href: "/merchant/support" },
  { label: "Partner With Us", href: "/partners" },
  { label: "Advertising", href: "/advertising" },
];

const HELP_LINKS = [
  { label: "Help Center", href: "/help" },
  { label: "Community", href: "/community" },
  { label: "Brand Directory", href: "/brands" },
  { label: "Customer Service", href: "/contact-us" },
  { label: "Your Account", href: "/account" },
  { label: "Your Order", href: "/orders" },
  { label: "Shipping  Rates & Policies", href: "/shipping" },
  { label: "Returns & Replacements", href: "/returns" },
];

const TRUST_BADGES = [
  { icon: ShieldCheckIcon, label: "100 % SECURE CHECKOUT" },
  { icon: HeadphonesIcon, label: "24/7 DEDICATED\nSUPPORT" },
  { icon: StarIcon, label: "THOUSANDS OF GENUINE REVIEWS" },
];

export default function Footer() {
  return (
    <footer className="border-t" style={{ backgroundColor: "#E7E3F9" }}>

      {/* ── 4-column links ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">

          {/* Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wide">Company</h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Make Money with Us */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wide">Make Money with Us</h3>
            <ul className="space-y-2">
              {SELLER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Let Us Help You */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wide">Let Us Help You</h3>
            <ul className="space-y-2">
              {HELP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Phsar Digital — contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wide">Phsar Digital</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact-us"
                  className="flex items-start gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquareIcon size={13} className="mt-0.5 flex-shrink-0" />
                  Start A Conversation
                </Link>
              </li>
              <li>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPinIcon size={13} className="mt-0.5 flex-shrink-0" />
                  Address
                </div>
              </li>
              <li>
                <a
                  href="tel:+012000000"
                  className="flex items-start gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <PhoneIcon size={13} className="mt-0.5 flex-shrink-0" />
                  +012 ********
                </a>
              </li>
              <li>
                <a
                  href="mailto:Phsar.Digital@com.kh"
                  className="flex items-start gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MailIcon size={13} className="mt-0.5 flex-shrink-0" />
                  Phsar.Digital@com.kh
                </a>
              </li>
              <li>
                <Link
                  href="/support"
                  className="flex items-start gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HeadphonesIcon size={13} className="mt-0.5 flex-shrink-0" />
                  Support ticket
                </Link>
              </li>
              <li>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPinIcon size={13} className="mt-0.5 flex-shrink-0" />
                  street 124, Toul Kork, Cambodia
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── trust badges ── */}
      <div className="border-t border-b">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 py-5 sm:justify-between sm:px-6">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon size={22} className="flex-shrink-0 text-foreground" />
              <span className="whitespace-pre-line text-xs font-bold uppercase tracking-wide text-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── bottom bar ── */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Phsar Digital. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </div>

    </footer>
  );
}
