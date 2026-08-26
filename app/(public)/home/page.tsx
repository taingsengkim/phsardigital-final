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

/* Each section carries its own container and vertical rhythm (see ./section),
   so the page itself adds no spacing on top of them. */
export default function HomePage() {
  return (
    <main
      data-public-home
      className="flex min-h-screen flex-col bg-background text-foreground transition-colors"
    >
      {/* 1. Hero Section: Dual Carousel + Side Promo */}
      <HeroBanner />

      {/* 2. Popular Categories Horizontal Strip */}
      <PopularCategoriesStrip />
      
      {/* Today best deals section */}
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
    </main>
  );
}
