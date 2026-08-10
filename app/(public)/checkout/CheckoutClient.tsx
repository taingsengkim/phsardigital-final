"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getCart } from "@/app/api/cart";
import { createOrder } from "@/app/api/orders";
import type { Cart } from "@/lib/types";

export default function CheckoutClient() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    getCart()
      .then(setCart)
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, []);

  const total =
    cart?.items.reduce(
      (sum, item) => sum + (item.listing?.price ?? 0) * item.quantity,
      0
    ) ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      setError("Please enter a shipping address.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        shipping_address: address,
        payment_method: paymentMethod,
      });
      router.push(`/checkout/confirmation?orderId=${order.id}`);
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Loading…
      </p>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Your cart is empty. Add items before checking out.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 lg:grid-cols-5">
        {/* left: form */}
        <div className="space-y-6 lg:col-span-3">
          {/* shipping */}
          <section className="rounded-xl border p-5 space-y-4">
            <h2 className="text-base font-semibold">Shipping Address</h2>
            <div className="flex flex-col gap-1">
              <label htmlFor="address" className="text-sm font-medium">
                Full address
              </label>
              <textarea
                id="address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, Country, ZIP"
                className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                required
              />
            </div>
          </section>

          {/* payment */}
          <section className="rounded-xl border p-5 space-y-4">
            <h2 className="text-base font-semibold">Payment Method</h2>
            <div className="space-y-2">
              {["card", "bank_transfer", "cash_on_delivery"].map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-primary"
                  />
                  <span className="text-sm capitalize">
                    {method.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Placing order…" : `Place Order · $${total.toFixed(2)}`}
          </Button>
        </div>

        {/* right: summary */}
        <aside className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold">Order Summary</h2>
          <div className="rounded-xl border divide-y">
            {cart.items.map((item) => {
              const img =
                item.listing?.images?.find((i) => i.is_primary) ??
                item.listing?.images?.[0];
              return (
                <div key={item.id} className="flex items-center gap-3 p-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {img && (
                      <Image
                        src={img.url}
                        alt={img.alt_text ?? ""}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">
                      {item.listing?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      × {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-semibold">
                    ${((item.listing?.price ?? 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </form>
  );
}
