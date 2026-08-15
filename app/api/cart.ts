/**
 * Cart API — maps to /api/v1/carts
 * Real endpoints from: https://phsardigital.quizzy.it.com/swagger-ui/index.html
 *
 * The cart is seller-scoped: each seller has their own cart.
 * GET  /api/v1/carts                         → all carts (array)
 * GET  /api/v1/carts/{sellerId}              → cart for one seller
 * POST /api/v1/carts/items                   → add item
 * PATCH /api/v1/carts/{sellerId}/items/{uuid} → update qty
 * DELETE /api/v1/carts/{sellerId}/items/{uuid} → remove item
 * DELETE /api/v1/carts/{sellerId}            → clear cart
 */

import { clientFetch } from "@/lib/api";

export type CartItem = {
  uuid: string;
  listingUuid: string;
  title: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Cart = {
  uuid: string;
  sellerId: string;
  items: CartItem[];
  totalPrice: number;
};

/** GET /api/v1/carts — returns all seller carts for the logged-in buyer */
export async function getMyCarts(): Promise<Cart[]> {
  return clientFetch<Cart[]>("/api/v1/carts");
}

/** GET /api/v1/carts/{sellerId} */
export async function getCartBySeller(sellerId: string): Promise<Cart> {
  return clientFetch<Cart>(`/api/v1/carts/${sellerId}`);
}

/** POST /api/v1/carts/items */
export async function addToCart(listingUuid: string, quantity = 1): Promise<Cart> {
  return clientFetch<Cart>("/api/v1/carts/items", {
    method: "POST",
    body: JSON.stringify({ listingUuid, quantity }),
  });
}

/** PATCH /api/v1/carts/{sellerId}/items/{itemUuid} */
export async function updateCartItem(
  sellerId: string,
  itemUuid: string,
  quantity: number
): Promise<Cart> {
  return clientFetch<Cart>(`/api/v1/carts/${sellerId}/items/${itemUuid}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

/** DELETE /api/v1/carts/{sellerId}/items/{itemUuid} */
export async function removeCartItem(
  sellerId: string,
  itemUuid: string
): Promise<Cart> {
  return clientFetch<Cart>(`/api/v1/carts/${sellerId}/items/${itemUuid}`, {
    method: "DELETE",
  });
}

/** DELETE /api/v1/carts/{sellerId} — clear entire cart */
export async function clearCart(sellerId: string): Promise<void> {
  return clientFetch<void>(`/api/v1/carts/${sellerId}`, { method: "DELETE" });
}
