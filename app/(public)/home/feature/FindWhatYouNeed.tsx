"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronsUpDown } from "lucide-react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { mockCategoryPanelListings } from "../listing-mock";
import { getPrimaryImage } from "../listing-helpers";
import { SectionHeader } from "../SectionHeader";

const panels: { slug: string; label: string; count: number }[] = [
  { slug: "personal-care", label: "Personal Care", count: 26 },
  { slug: "sports-outdoor", label: "Sports & Outdoor", count: 26 },
  { slug: "shoes", label: "Shoes", count: 100 },
  { slug: "kitchen", label: "Kitchen", count: 26 },
];

function CategoryPanel({ slug, label, count }: { slug: string; label: string; count: number }) {
  const listings = mockCategoryPanelListings[slug] ?? [];

  return (
    <div className="rounded-xl border border-[#EDEBF3] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-bold text-[#241F35]">{label}</p>
          <p className="text-xs text-[#8B85A0]">{count} Products</p>
        </div>
        <Link
          href={`/categories/${slug}`}
          className="flex items-center gap-0.5 text-xs font-semibold text-[#6C4CD8] hover:underline"
        >
          View All <ChevronsUpDown size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {listings.map((listing) => (
          <motion.div
            key={listing.id}
            whileHover={{ scale: 1.06 }}
            className="aspect-square overflow-hidden rounded-lg bg-[#F5F3FA]"
          >
            <Image
              src={getPrimaryImage(listing)}
              alt={listing.title}
              width={100}
              height={100}
              className="h-full w-full object-cover"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function FindWhatYouNeed() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Promo panel */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl bg-[#EDE8FA] p-6 shadow-sm"
        >
          <Image
            src="/picture/pic5.jpg"
            alt="Promo product"
            fill
            className="object-cover object-center opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-black leading-snug text-white">Bring nature into your home</h3>
            <div>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-[#6C4CD8] px-6 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(108,76,216,0.4)] transition-all duration-300 hover:scale-105 hover:bg-[#5B3DC0]"
              >
                Shop Now
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Category panels */}
        <div className="space-y-4">
          <SectionHeader title="Find What You Need" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {panels.map((panel) => (
              <CategoryPanel key={panel.slug} {...panel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
