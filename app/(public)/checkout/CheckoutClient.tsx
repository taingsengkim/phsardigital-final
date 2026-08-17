"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Truck,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Building,
  MapPin,
  QrCode,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getListingBySlug } from "@/app/api/listings";
import { getCart } from "@/app/api/cart";
import { createOrder } from "@/app/api/orders";
import type { Listing } from "@/lib/types";

type CheckoutItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
};

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const slugParam = searchParams.get("slug");
  const qtyParam = searchParams.get("qty");

  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<{ id: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("Vanneth Sok");
  const [phone, setPhone] = useState("096 888 7777");
  const [city, setCity] = useState("Phnom Penh");
  const [address, setAddress] = useState("House #42B, Street 271, Tuol Sangkae 2, Ruessei Kaev");
  const [paymentMethod, setPaymentMethod] = useState<"khqr" | "card" | "cod">("khqr");

  useEffect(() => {
    async function loadCheckoutData() {
      setLoading(true);
      try {
        if (slugParam) {
          // Loaded directly from "Buy Now"
          const listing: Listing = await getListingBySlug(slugParam);
          const primaryImg = listing.images?.find((img) => img.is_primary)?.url ?? listing.images?.[0]?.url ?? "/picture/pic1.jpg";
          const parsedQty = Math.max(1, parseInt(qtyParam ?? "1", 10));

          setItems([
            {
              id: listing.id,
              title: listing.title,
              price: listing.price,
              quantity: parsedQty,
              image: primaryImg,
              slug: listing.slug,
            },
          ]);
        } else {
          // Loaded from cart
          const cart = await getCart();
          if (cart && cart.items && cart.items.length > 0) {
            const mappedItems: CheckoutItem[] = cart.items.map((item) => {
              const img = item.listing?.images?.find((i) => i.is_primary)?.url ?? item.listing?.images?.[0]?.url ?? "/picture/pic1.jpg";
              return {
                id: item.listing_id,
                title: item.listing?.title ?? "Product Item",
                price: item.listing?.price ?? 0,
                quantity: item.quantity,
                image: img,
                slug: item.listing?.slug,
              };
            });
            setItems(mappedItems);
          } else {
            // Default mock item fallback if cart empty
            setItems([
              {
                id: 101,
                title: "POCO Smart Phone — 8GB RAM / 256GB Storage (5G Dual SIM)",
                price: 229.50,
                quantity: 1,
                image: "/picture/pic1.jpg",
                slug: "poco-smart-phone",
              },
            ]);
          }
        }
      } catch {
        setError("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [slugParam, qtyParam]);

  // Price calculations
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = subtotal > 100 ? 10 : 0;
  const shippingFee = subtotal >= 50 ? 0 : 1.5;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim() || !phone.trim() || !fullName.trim()) {
      setError("Please fill in all required shipping details.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await createOrder({
        shipping_address: `${fullName} (${phone}) - ${address}, ${city}`,
        payment_method: paymentMethod,
        items: items.map((i) => ({
          listing_id: i.id,
          quantity: i.quantity,
          unit_price: i.price,
        })),
      });

      setOrderCompleted({ id: order.id, total: grandTotal });
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#6C4CD8] border-t-transparent" />
        <p className="mt-4 text-[16px] font-semibold text-[#8B85A0]">Preparing your checkout details…</p>
      </div>
    );
  }

  // Order Success Screen
  if (orderCompleted) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-[0_8px_32px_rgba(108,76,216,0.12)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={44} />
        </div>
        <h1 className="mt-6 text-[28px] font-black text-[#1A1330]">Order Confirmed!</h1>
        <p className="mt-2 text-[15px] text-[#8B85A0]">
          Thank you, <span className="font-bold text-[#1A1330]">{fullName}</span>! Your order has been placed successfully.
        </p>

        <div className="my-6 rounded-2xl bg-[#F6F5FA] p-5 text-left text-[14px] text-[#3F3A52] space-y-2">
          <div className="flex justify-between">
            <span className="text-[#8B85A0]">Order Number</span>
            <span className="font-extrabold text-[#6C4CD8]">#ORD-{orderCompleted.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8B85A0]">Payment Method</span>
            <span className="font-semibold capitalize text-[#1A1330]">{paymentMethod.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8B85A0]">Delivery Address</span>
            <span className="font-medium text-right text-[#1A1330] max-w-[240px] truncate">{address}, {city}</span>
          </div>
          <div className="border-t border-[#E2DFEC] pt-2 flex justify-between font-extrabold text-[16px]">
            <span>Total Paid</span>
            <span className="text-[#6C4CD8]">${orderCompleted.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-[14px] font-semibold text-emerald-700">
          <Truck size={18} className="shrink-0" />
          Estimated Delivery: 24–48 Hours in Phnom Penh
        </div>

        <Link
          href="/products"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] py-4 text-[16px] font-bold text-white shadow-md transition hover:bg-[#5B3DC0]"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-[15px] text-[#8B85A0]">
          <li>
            <Link href="/" className="hover:text-[#6C4CD8] transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight size={13} className="opacity-50" />
          <li>
            <Link href="/products" className="hover:text-[#6C4CD8] transition-colors">
              Products
            </Link>
          </li>
          <ChevronRight size={13} className="opacity-50" />
          <li className="font-semibold text-[#1A1330]">Checkout</li>
        </ol>
      </nav>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]">
          {/* ── LEFT COLUMN: Shipping & Payment ── */}
          <div className="space-y-8">
            {/* Delivery Address Section */}
            <section className="rounded-3xl border border-[#EDEBF3] bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#F0EDFB] pb-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1EFFA] text-[#6C4CD8]">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="text-[20px] font-extrabold text-[#1A1330]">Delivery Address</h2>
                  <p className="text-[13px] text-[#8B85A0]">Where should we ship your order?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                    Phone Number (Cambodia) *
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="096 123 4567"
                    className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="city" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                    City / Province *
                  </label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                  >
                    <option value="Phnom Penh">Phnom Penh (ភ្នំពេញ)</option>
                    <option value="Siem Reap">Siem Reap (សៀមរាប)</option>
                    <option value="Battambang">Battambang (បាត់ដំបង)</option>
                    <option value="Kampong Cham">Kampong Cham (កំពង់ចាម)</option>
                    <option value="Sihanoukville">Sihanoukville (ព្រះសីហនុ)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                    Street Address / House No. *
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="House number, street name, Sangkat, Khan"
                    className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method Section */}
            <section className="rounded-3xl border border-[#EDEBF3] bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#F0EDFB] pb-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1EFFA] text-[#6C4CD8]">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-[20px] font-extrabold text-[#1A1330]">Payment Method</h2>
                  <p className="text-[13px] text-[#8B85A0]">Choose how you want to pay</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "khqr",
                    title: "ABA PAY / KHQR Scan",
                    sub: "Instant mobile banking scan with zero fees",
                    Icon: QrCode,
                    badge: "Recommended",
                  },
                  {
                    id: "card",
                    title: "Credit / Debit Card",
                    sub: "Visa, Mastercard, or UnionPay",
                    Icon: CreditCard,
                  },
                  {
                    id: "cod",
                    title: "Cash on Delivery (COD)",
                    sub: "Pay cash upon receiving package in Phnom Penh",
                    Icon: Truck,
                  },
                ].map(({ id, title, sub, Icon, badge }) => (
                  <label
                    key={id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all",
                      paymentMethod === id
                        ? "border-[#6C4CD8] bg-[#F8F7FC] shadow-sm"
                        : "border-[#EDEBF3] bg-white hover:border-[#C4B5FD]"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={id}
                        checked={paymentMethod === id}
                        onChange={() => setPaymentMethod(id as "khqr" | "card" | "cod")}
                        className="h-5 w-5 accent-[#6C4CD8]"
                      />
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs text-[#6C4CD8]">
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-extrabold text-[#1A1330]">{title}</p>
                          {badge && (
                            <span className="rounded-md bg-[#6C4CD8] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                              {badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-[#8B85A0]">{sub}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN: Order Summary ── */}
          <div>
            <div className="sticky top-24 rounded-3xl border border-[#EDEBF3] bg-white p-7 shadow-[0_4px_24px_rgba(108,76,216,0.08)] space-y-6">
              <h2 className="text-[20px] font-extrabold text-[#1A1330] border-b border-[#F0EDFB] pb-4">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5F3FA] border border-[#EDEBF3]">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1A1330] truncate">{item.title}</p>
                      <p className="text-[13px] text-[#8B85A0]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[15px] font-extrabold text-[#6C4CD8]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-[#F0EDFB] pt-4 space-y-2.5 text-[14px]">
                <div className="flex justify-between text-[#8B85A0]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1A1330]">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Savings</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#8B85A0]">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-[#1A1330]">
                    {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-[#EDEBF3] pt-3 flex justify-between text-[18px] font-extrabold text-[#1A1330]">
                  <span>Total</span>
                  <span className="text-[22px] text-[#6C4CD8]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-[13px] font-semibold text-red-600">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6C4CD8] py-4 text-[17px] font-bold text-white shadow-[0_8px_25px_rgba(108,76,216,0.35)] transition-all hover:scale-[1.02] hover:bg-[#5B3DC0] disabled:opacity-50"
              >
                {submitting ? (
                  "Processing Order..."
                ) : (
                  <>
                    Place Order · ${grandTotal.toFixed(2)}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-2 pt-2 text-[12px] font-semibold text-[#8B85A0]">
                <ShieldCheck size={16} className="text-[#6C4CD8]" />
                100% Encrypted &amp; Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
