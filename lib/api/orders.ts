import type { Order } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Create an order from the current cart (checkout).
 * Returns the new Order with its order_items.
 */
export async function createOrder(payload: {
  shipping_address: string;
  payment_method: string;
}): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/api/orders`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function getOrderById(orderId: number): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Order not found: ${orderId}`);
  return res.json();
}
