"use client";

import { HeroBanner } from "./feature/HeroBanner";
import { PopularCategoriesStrip } from "./feature/PopularCategoriesStrip";
import { FlashDealsSection } from "./feature/FlashDealsSection";
import { TopSellersSection } from "./feature/TopSellersSection";
import { TrendingSection } from "./feature/TrendingSection";
import { PromoBannersRow } from "./feature/PromoBannersRow";
import { WearableSection } from "./feature/WearableSection";
import { RecommendedSection } from "./feature/RecommendedSection";
import { SiteFeatures } from "./feature/SiteFeatures";
import { NewsletterSignup } from "./feature/NewsletterSignup";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#111827] flex flex-col space-y-4 sm:space-y-6">
      {/* 1. Hero Section: Dual Carousel + Side Promo */}
      <HeroBanner />

      {/* 2. Popular Categories Horizontal Strip */}
      <PopularCategoriesStrip />

      {/* 3. Flash Deals with Live Countdown & Big Deal Card */}
      <FlashDealsSection />

      {/* 4. Top Sellers 4-Card Marketplace Stores */}
      <TopSellersSection />

      {/* 5. Trending Products with Side Collection Spotlight */}
      <TrendingSection />

      {/* 6. Promotional Marketing Banners */}
      <PromoBannersRow />

      {/* 7. Category Showcase & Dress Apparel with Tabs */}
      <WearableSection />

      {/* 8. Daily Discover / Recommended 5-Column Grid */}
      <RecommendedSection />

      {/* 9. Site Features / 4 Trust Badges */}
      <SiteFeatures />

      {/* 10. Newsletter Signup Banner */}
      <NewsletterSignup />
    </main>
  );
}
