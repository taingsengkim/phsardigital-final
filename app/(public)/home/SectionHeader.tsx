"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type SectionHeaderProps = {
  title: string;
  href?: string; // "View All" destination
  onPrev?: () => void; // wire these up if the section becomes a scroll-carousel
  onNext?: () => void;
  className?: string;
};

/**
 * If you already built a shared/SectionHeader.tsx in an earlier session,
 * skip this file and just make sure it supports the same props — the home
 * sections below import { SectionHeader } from "@/components/shared/SectionHeader".
 */
export function SectionHeader({ title, href = "#", onPrev, onNext, className }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className ?? ""}`}>
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      <div className="flex items-center gap-2">
        <Link href={href}>
          <motion.span
            whileHover={{ x: 2 }}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
          >
            View All
          </motion.span>
        </Link>
        {(onPrev || onNext) && (
          <div className="hidden items-center gap-1 sm:flex">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPrev}
              aria-label="Previous"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground hover:bg-accent"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onNext}
              aria-label="Next"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
