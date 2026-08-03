import type { Cart, CartItem } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getCart(): Promise<Cart> {
  const res = await fetch(`${BASE_URL}/api/cart`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(
  listingId: number,
  quantity = 1
): Promise<CartItem> {
  const res = await fetch(`${BASE_URL}/api/cart/items`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing_id: listingId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

export async function updateCartItem(
  itemId: number,
  quantity: number
): Promise<CartItem> {
  const res = await fetch(`${BASE_URL}/api/cart/items/${itemId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to update cart item");
  return res.json();
}

export async function removeCartItem(itemId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/cart/items/${itemId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to remove cart item");
}
