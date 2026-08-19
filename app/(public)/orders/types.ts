export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
};

export type UserOrder = {
  id: string; // e.g. "ORD-98421"
  date: string; // e.g. "Aug 16, 2026 at 2:30 PM"
  storeName: string;
  storeSlug: string;
  status: OrderStatus;
  estimatedDelivery: string;
  shippingAddress: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  discount?: number;
  shippingFee?: number;
  items: OrderItem[];
  trackingNumber?: string;
  courier?: string;
};
