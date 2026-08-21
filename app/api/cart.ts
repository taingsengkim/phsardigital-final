import type { Cart, CartItem } from "@/lib/types";
import { generateDynamicMockListing } from "./listings";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Pre-populated default multi-item cart containing 3 distinct products
 */
const DEFAULT_MOCK_ITEMS: CartItem[] = [
  {
    id: 1,
    cart_id: 1,
    listing_id: 101,
    quantity: 1,
    listing: generateDynamicMockListing("women-s-floral-summer-dress"),
  },
  {
    id: 2,
    cart_id: 1,
    listing_id: 102,
    quantity: 1,
    listing: generateDynamicMockListing("macbook-laptops"),
  },
  {
    id: 3,
    cart_id: 1,
    listing_id: 103,
    quantity: 1,
    listing: generateDynamicMockListing("iphone-12-pro-pacific-blue-128gb"),
  },
  {
    id: 4,
    cart_id: 1,
    listing_id: 104,
    quantity: 1,
    listing: generateDynamicMockListing("minimalist-canvas-backpack"),
  },
];

let mockCartItems: CartItem[] = [...DEFAULT_MOCK_ITEMS];

export type ApiSellerProfile = {
  sellerId?: string | null;
  businessName?: string | null;
  logoUri?: string | null;
  phoneNumber?: string | null;
  biography?: string | null;
  socialLink?: string[] | null;
};

export type ApiCartItem = {
  uuid: string;
  listingUuid: string;
  title: string;
  thumbnailUri?: string | { uri?: string; objectName?: string } | null;
  fullPrice?: number | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type VendorCart = {
  uuid: string;
  sellerId?: string | null;
  sellerProfile?: ApiSellerProfile | null;
  items: ApiCartItem[];
  totalPrice: number;
};

export async function getCarts(): Promise<VendorCart[]> {
  try {
    const res = await fetch("/api/carts", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn("Failed to fetch carts from route handler:", err);
  }

  // Fallback to sample mock vendor carts matching user backend API schema
  return [
    {
      uuid: "adbc335b-fb28-4b53-9289-5104b54f1f03",
      sellerId: "6e443fad-e712-49f4-8e63-ad6c5e50f399",
      sellerProfile: {
        sellerId: "6e443fad-e712-49f4-8e63-ad6c5e50f399",
        businessName: "SOMA Coffee & Roastery",
        logoUri: "/picture/pic1.jpg",
      },
      items: [
        {
          uuid: "80f60724-4817-45f1-a5dc-f316f16be395",
          listingUuid: "ac364012-6788-4df9-baf9-a7815753d9c1",
          title: "Wireless Mechanical Keyboard",
          thumbnailUri: "/picture/pic7.jpg",
          fullPrice: 89.99,
          unitPrice: 89.99,
          quantity: 7,
          lineTotal: 629.93,
        },
        {
          uuid: "796cd4ac-7946-4444-9766-d48a3ade6610",
          listingUuid: "a99cbb20-21a9-4349-ab9f-30e1b6aff5c4",
          title: "ISTAD Friends Hoodie",
          thumbnailUri: "/picture/pic3.jpg",
          fullPrice: 25,
          unitPrice: 25,
          quantity: 9,
          lineTotal: 225,
        },
      ],
      totalPrice: 854.93,
    },
  ];
}

export async function getCart(): Promise<Cart> {
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/cart`, { credentials: "include" });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
  }

  return {
    id: 1,
    user_id: 1,
    items: mockCartItems,
  };
}

export async function addToCart(
  listingId: number | string,
  quantity = 1,
  slug?: string
): Promise<CartItem> {
  try {
    const res = await fetch("/api/carts/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingUuid: String(listingId),
        quantity,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      // If backend returns a cart item, return it
      if (data && (data.id || data.cart_id)) return data;
    }
  } catch (err) {
    console.warn("Cart route handler call error, falling back locally:", err);
  }

  // Local fallback for offline/guest demo interactive UX
  const existing = mockCartItems.find(
    (i) => i.listing_id === listingId || i.listing?.uuid === listingId
  );
  if (existing) {
    existing.quantity += quantity;
    return existing;
  }

  const listingSlug = slug ?? "poco-smart-phone";
  const listing = generateDynamicMockListing(listingSlug);
  if (typeof listingId === "number") {
    listing.id = listingId;
  }

  const newItem: CartItem = {
    id: mockCartItems.length + 1,
    cart_id: 1,
    listing_id: typeof listingId === "number" ? listingId : mockCartItems.length + 1,
    quantity,
    listing,
  };

  mockCartItems.push(newItem);
  return newItem;
}

export async function updateCartItem(
  itemId: number,
  quantity: number
): Promise<CartItem> {
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/cart/items/${itemId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
  }

  const item = mockCartItems.find((i) => i.id === itemId || i.listing_id === itemId);
  if (item) {
    item.quantity = quantity;
    return item;
  }
  throw new Error("Item not found");
}

export async function removeCartItem(itemId: number): Promise<void> {
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/cart/items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) return;
    } catch {
      // Fallback
    }
  }

  mockCartItems = mockCartItems.filter((i) => i.id !== itemId && i.listing_id !== itemId);
}

export async function updateCartItemQty(
  sellerId: string,
  itemUuid: string,
  quantity: number
): Promise<any> {
  try {
    const res = await fetch(
      `/api/carts/${encodeURIComponent(sellerId)}/items/${encodeURIComponent(itemUuid)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Failed to update cart item quantity via route handler:", err);
  }
}

export async function deleteCartItem(
  sellerId: string,
  itemUuid: string
): Promise<any> {
  try {
    const res = await fetch(
      `/api/carts/${encodeURIComponent(sellerId)}/items/${encodeURIComponent(itemUuid)}`,
      {
        method: "DELETE",
      }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Failed to delete cart item via route handler:", err);
  }
}

export async function deleteSellerCart(sellerId: string): Promise<any> {
  try {
    const res = await fetch(`/api/carts/${encodeURIComponent(sellerId)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Failed to delete seller cart via route handler:", err);
  }
}
