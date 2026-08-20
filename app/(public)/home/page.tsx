// Reference only — merge this ordering into your real app/page.tsx around
// your existing <Navbar /> / category strip / <Footer />. Not meant to
// overwrite your file directly since I don't have it.

import { FindWhatYouNeed } from "./feature/FindWhatYouNeed";
import { HeroBanner } from "./feature/HeroBanner";  
import { NewsletterSignup } from "./feature/NewsletterSignup";
import { RecommendedSection } from "./feature/RecommendedSection";
import { TopRatedSection } from "./feature/TopRatedSection";
import { TopSellersSection } from "./feature/TopSellersSection";
import { WearableSection } from "./feature/WearableSection";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F6F5FA] text-[#241F35]">
      {/* <Navbar /> */}
      {/* <CategoryStrip /> */}

      <HeroBanner />
      <TopSellersSection />
      <FindWhatYouNeed />
      {/* <CategoriesIconRow /> */}
      <RecommendedSection />
      <TopRatedSection />
      <WearableSection />
      <NewsletterSignup />

      {/* <Footer /> */}
    </main>
  );
}
