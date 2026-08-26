import { getFileUrl } from "@/lib/utils";
import type { Purchase } from "@/lib/types/purchase";
import type { OrderStatus, UserOrder } from "./types";

/** Short quotable reference; the uuid itself is what the API takes. */
export function orderRef(uuid?: string): string {
  if (!uuid) return "#ORD";
  return `#ORD-${uuid.slice(0, 8).toUpperCase()}`;
}

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * PurchaseResponse -> the shape this screen renders.
 *
 * A purchase item carries no image of its own, so the thumbnail falls back to a
 * placeholder rather than pretending to have one.
 */
export function adaptPurchase(purchase: Purchase): UserOrder {
  const items = (purchase.items ?? []).map((item, index) => ({
    id: item.listingUuid ?? `${purchase.uuid}-${index}`,
    title: item.title ?? "Product",
    price: item.unitPrice ?? 0,
    quantity: item.quantity ?? 1,
    image: getFileUrl(null) || "/picture/pic1.jpg",
    slug: item.listingUuid ?? "",
  }));

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    uuid: purchase.uuid,
    id: orderRef(purchase.uuid),
    date: formatDate(purchase.createdAt),
    storeName: purchase.businessName?.trim() || "Shop",
    storeSlug: purchase.sellerId ?? "",
    status: (purchase.status as OrderStatus) ?? "PENDING",
    shippingAddress: purchase.shippingAddress ?? "",
    total: purchase.totalPrice ?? subtotal,
    subtotal,
    items,
    note: purchase.note ?? null,
  };
}
