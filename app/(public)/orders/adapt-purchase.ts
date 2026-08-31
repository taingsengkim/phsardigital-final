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
  const items = (purchase.items ?? []).map((item, index) => {
    const titleLower = (item.title ?? "").toLowerCase();
    const fallbackImg = titleLower.includes("keyboard")
      ? "/picture/pic7.jpg"
      : titleLower.includes("hoodie") || titleLower.includes("dress")
      ? "/picture/pic3.jpg"
      : titleLower.includes("phone")
      ? "/picture/pic1.jpg"
      : titleLower.includes("cat") || titleLower.includes("pet")
      ? "/picture/pic4.jpg"
      : titleLower.includes("coffee")
      ? "/picture/pic2.jpg"
      : `/picture/pic${(index % 7) + 1}.jpg`;

    const image = item.thumbnailUrl
      ? item.thumbnailUrl.startsWith("http") || item.thumbnailUrl.startsWith("/")
        ? item.thumbnailUrl
        : getFileUrl(item.thumbnailUrl)
      : fallbackImg;

    return {
      id: item.listingUuid ?? `${purchase.uuid}-${index}`,
      title: item.title ?? "Product",
      price: typeof item.unitPrice === "number" && !isNaN(item.unitPrice) ? item.unitPrice : 0,
      quantity: item.quantity ?? 1,
      image,
      slug: item.slug || item.listingUuid || "",
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const isOnline = purchase.channel !== "POS";

  return {
    uuid: purchase.uuid,
    id: orderRef(purchase.uuid),
    date: formatDate(purchase.createdAt),
    storeName: purchase.businessName?.trim() || "Phsar Digital Store",
    storeSlug: purchase.sellerId ?? "",
    status: (purchase.status as OrderStatus) ?? "PENDING",
    shippingAddress: purchase.shippingAddress || "Standard Delivery Address",
    total: typeof purchase.totalPrice === "number" && !isNaN(purchase.totalPrice) ? purchase.totalPrice : subtotal,
    subtotal,
    items,
    note: purchase.note?.trim() || null,
    paymentMethod: "Pay on Delivery (COD)",
    courier: "VET Express (Cambodia)",
    trackingNumber: purchase.uuid ? `EX-${purchase.uuid.slice(0, 8).toUpperCase()}` : "EX-00000000",
    estimatedDelivery:
      purchase.status === "COMPLETED"
        ? "Delivered"
        : purchase.status === "CANCELLED"
        ? "Cancelled"
        : purchase.status === "CONFIRMED"
        ? "In Transit (1–2 Days)"
        : "Awaiting Confirmation",
  };
}
