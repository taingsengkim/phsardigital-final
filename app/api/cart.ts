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
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/cart/items`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, quantity }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
  }

  const existing = mockCartItems.find((i) => i.listing_id === listingId);
  if (existing) {
    existing.quantity += quantity;
    return existing;
  }

  const listingSlug = slug ?? "poco-smart-phone";
  const listing = generateDynamicMockListing(listingSlug);
  listing.id = listingId as number;

  const newItem: CartItem = {
    id: mockCartItems.length + 1,
    cart_id: 1,
    listing_id: listingId as number,
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
