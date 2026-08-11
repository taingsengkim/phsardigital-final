import type { Seller } from "@/lib/types";

/**
 * Only sellers stay mocked — see the comment in `../types/index.ts` for
 * why. Everything else (products, categories) is fetched live via
 * `@/lib/api/endpoints/*` hooks now.
 */
export const TOP_SELLERS: Seller[] = [
  {
    id: "1",
    slug: "storee-corner",
    name: "Storee Corner",
    bannerImage: "/images/sellers/storee-corner.jpg",
    rating: 5,
    reviewCount: 5,
    productCount: 190,
  },
  {
    id: "2",
    slug: "dance-skirts",
    name: "Dance skirts",
    bannerImage: "/images/sellers/dance-skirts.jpg",
    rating: 5,
    reviewCount: 5,
    productCount: 190,
  },
  {
    id: "3",
    slug: "skatery",
    name: "Skatery",
    bannerImage: "/images/sellers/skatery.jpg",
    rating: 5,
    reviewCount: 5,
    productCount: 190,
  },
  {
    id: "4",
    slug: "flowero",
    name: "Flowero",
    bannerImage: "/images/sellers/flowero.jpg",
    rating: 5,
    reviewCount: 5,
    productCount: 190,
  },
];
