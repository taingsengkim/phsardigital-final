"use client";

import { Truck, ShieldCheck, Headphones, Gift } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: Truck,
    title: "Rapid Shipping",
    description: "Fast doorstep delivery across Cambodia with live tracking",
    bgColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: ShieldCheck,
    title: "Secure Transaction",
    description: "100% safe checkout with verified seller & buyer protection",
    bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Headphones,
    title: "24/7 Dedicated Support",
    description: "Friendly expert assistance ready to answer calls & chats",
    bgColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    icon: Gift,
    title: "Exclusive Bundle Offers",
    description: "Curated package discounts and member rewards on every store",
    bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

export function SiteFeatures() {
  return (
    <section className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 py-6 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className={`size-12 rounded-2xl ${feature.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className="size-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#111827] dark:text-white">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-snug">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
