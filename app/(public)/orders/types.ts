/**
 * The buyer's view of a purchase.
 *
 * Statuses are the API's own (PurchaseResponse.status) rather than a
 * courier-flavoured vocabulary of our own: the server is the only thing that
 * moves an order between them, so inventing "shipped"/"delivered" on top would
 * be a label we could never keep true.
 */
export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
};

export type UserOrder = {
  /** The purchase uuid — what the API's status endpoints take. */
  uuid: string;
  /** Short quotable reference derived from the uuid, e.g. "#ORD-3F2A1B9C". */
  id: string;
  date: string;
  storeName: string;
  storeSlug: string;
  status: OrderStatus;
  shippingAddress: string;
  total: number;
  subtotal: number;
  items: OrderItem[];
  note?: string | null;
  /** Not modelled by the API — kept optional so the UI can degrade. */
  estimatedDelivery?: string;
  paymentMethod?: string;
  discount?: number;
  shippingFee?: number;
  trackingNumber?: string;
  courier?: string;
};
