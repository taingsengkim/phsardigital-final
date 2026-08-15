/**
 * Purchase / Order API — maps to /api/v1/purchases
 * Real endpoints from: https://phsardigital.quizzy.it.com/swagger-ui/index.html
 *
 * POST   /api/v1/purchases/checkout/{sellerId}  → checkout (creates purchase)
 * GET    /api/v1/purchases                       → my purchases (buyer)
 * GET    /api/v1/purchases/{uuid}                → single purchase
 * PATCH  /api/v1/purchases/{uuid}/confirm        → seller confirms
 * PATCH  /api/v1/purchases/{uuid}/complete       → mark completed
 * PATCH  /api/v1/purchases/{uuid}/cancel         → cancel
 */

import { clientFetch } from "@/lib/api";

export type PurchaseItem = {
  listingUuid: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Purchase = {
  uuid: string;
  buyerId: string;
  sellerId: string;
  businessName: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  shippingAddress: string;
  note?: string;
  items: PurchaseItem[];
  createdAt: string;
};

export type PagedPurchases = {
  content: Purchase[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

/** POST /api/v1/purchases/checkout/{sellerId} */
export async function checkout(
  sellerId: string,
  payload: { shippingAddress: string; note?: string }
): Promise<Purchase> {
  return clientFetch<Purchase>(`/api/v1/purchases/checkout/${sellerId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /api/v1/purchases */
export async function getMyPurchases(
  pageNumber = 0,
  pageSize = 20
): Promise<PagedPurchases> {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });
  return clientFetch<PagedPurchases>(`/api/v1/purchases?${params}`);
}

/** GET /api/v1/purchases/{uuid} */
export async function getPurchase(uuid: string): Promise<Purchase> {
  return clientFetch<Purchase>(`/api/v1/purchases/${uuid}`);
}

/** PATCH /api/v1/purchases/{uuid}/cancel */
export async function cancelPurchase(uuid: string): Promise<Purchase> {
  return clientFetch<Purchase>(`/api/v1/purchases/${uuid}/cancel`, {
    method: "PATCH",
  });
}
