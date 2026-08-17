"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronsUpDown } from "lucide-react";
import { mockCategories } from "../categories-mock";
import { Button } from "@/components/ui/ButtonPurple";

/**
 * TODO when your API is ready: replace `mockCategories` with
 * `const { data: categories = [] } = useGetCategoriesQuery();`
 * from "@/lib/api/homeApi" — everything else stays the same since both
 * are typed as Category[].
 */
export function HeroBanner() {
  const categories = mockCategories;

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[260px_1fr]">
      {/* Sidebar category list — hidden on mobile, this is desktop-first like the design */}
      <aside className="hidden rounded-xl border border-border bg-card p-2 lg:block">
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {category.name}
                <ChevronsUpDown size={14} className="text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex min-h-[280px] items-center overflow-hidden rounded-xl bg-muted"
      >
        <Image
          src="https://picsum.photos/seed/hero-banner/1200/500"
          alt="Fashion sale promo"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 75vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

        <div className="relative max-w-sm space-y-4 p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            Shopping Today <span className="text-primary">Fashion sale</span>
          </h1>
          <p className="text-foreground/80">
            <span className="font-semibold text-gold">30% off</span> Hurry up!!!
          </p>
          <Button variant="primary" size="lg">
            Shop now
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
