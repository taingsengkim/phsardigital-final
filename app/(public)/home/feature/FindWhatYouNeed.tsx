"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronsUpDown } from "lucide-react";
import { mockCategoryPanelListings } from "../listing-mock";
import { getPrimaryImage } from "../listing-helpers";
import { SectionHeader } from "../SectionHeader";
import { Button } from "@/components/ui/ButtonPurple";

const panels: { slug: string; label: string; count: number }[] = [
  { slug: "personal-care", label: "Personal Care", count: 26 },
  { slug: "sports-outdoor", label: "Sports & Outdoor", count: 26 },
  { slug: "shoes", label: "Shoes", count: 100 },
  { slug: "kitchen", label: "Kitchen", count: 26 },
];

function CategoryPanel({ slug, label, count }: { slug: string; label: string; count: number }) {
  const listings = mockCategoryPanelListings[slug] ?? [];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{count} Products</p>
        </div>
        <Link
          href={`/categories/${slug}`}
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View All <ChevronsUpDown size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {listings.map((listing) => (
          <motion.div
            key={listing.id}
            whileHover={{ scale: 1.06 }}
            className="aspect-square overflow-hidden rounded-lg bg-muted"
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
          className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-xl bg-emerald-50 p-6 dark:bg-emerald-950/40"
        >
          <div className="relative z-10 max-w-[70%] space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Bring nature into your home</h3>
            <Button variant="primary">Shop Now →</Button>
          </div>
          <Image
            src="https://picsum.photos/seed/plant-leaf/500/500"
            alt="Decorative plant"
            fill
            className="object-cover object-bottom opacity-90"
          />
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
