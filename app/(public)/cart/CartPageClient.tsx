"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ShoppingCart, Lock } from "lucide-react";
import CartItemRow from "@/components/cart/CartItemRow";
import { getMyCarts } from "@/app/api/cart";
import type { Cart } from "@/app/api/cart";

export default function CartPageClient() {
  const [carts,   setCarts]   = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCarts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyCarts();
      setCarts(data ?? []);
    } catch {
      setCarts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCarts(); }, [fetchCarts]);

  /* flatten all items across seller carts */
  const allItems = carts.flatMap((cart) =>
    cart.items.map((item) => ({ ...item, sellerId: cart.sellerId, cartUuid: cart.uuid }))
  );

  const subtotal = carts.reduce((sum, c) => sum + c.totalPrice, 0);
  const itemCount = allItems.reduce((n, i) => n + i.quantity, 0);

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
      </div>
    );
  }

  /* ── empty state ── */
  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-28 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0EDFB]">
          <ShoppingCart size={36} className="text-[#6C4CD8]" />
        </div>
        <p className="text-[20px] font-bold text-[#1A1330]">Your bag is empty</p>
        <p className="text-[15px] text-[#8B85A0]">Add some products to get started</p>
        <Link
          href="/products"
          className="mt-2 rounded-xl bg-[#6C4CD8] px-8 py-3 text-[15px] font-bold text-white hover:bg-[#5B3DC0] transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

      {/* ── LEFT: item list ── */}
      <div className="space-y-4">
        {carts.map((cart) =>
          cart.items.map((item) => (
            <CartItemRow
              key={item.uuid}
              item={item}
              sellerId={cart.sellerId}
              onUpdate={fetchCarts}
            />
          ))
        )}
      </div>

      {/* ── RIGHT: order summary ── */}
      <div className="h-fit rounded-2xl border border-[#E2DFEC] bg-white p-6 shadow-[0_2px_16px_rgba(108,76,216,0.08)]">
        <h2 className="mb-5 text-[18px] font-extrabold text-[#1A1330]">
          Order Summary
        </h2>

        <div className="space-y-3 text-[15px]">
          <div className="flex justify-between">
            <span className="text-[#8B85A0]">
              Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
            </span>
            <span className="font-semibold text-[#1A1330]">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8B85A0]">Shipping</span>
            <span className="text-[#8B85A0]">Calculated at checkout</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8B85A0]">Tax</span>
            <span className="text-[#8B85A0]">Calculated at checkout</span>
          </div>
        </div>

        <div className="my-5 border-t border-[#F0EDFB]" />

        <div className="flex justify-between text-[17px] font-extrabold text-[#1A1330]">
          <span>Total</span>
          <span className="text-[#6C4CD8]">${subtotal.toFixed(2)}</span>
        </div>

        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7CB342] py-3.5 text-[16px] font-bold text-white shadow-md hover:bg-[#689F38] transition-colors"
        >
          <Lock size={16} />
          Proceed to Checkout
        </Link>

        <p className="mt-3 text-center text-[12px] text-[#B3ADC4]">
          🔒 Secure checkout powered by Phsar Digital
        </p>

        <Link
          href="/products"
          className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#E2DFEC] py-3 text-[14px] font-semibold text-[#6C4CD8] hover:bg-[#F1EFFA] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
