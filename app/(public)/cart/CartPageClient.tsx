"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
<<<<<<< HEAD
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
=======
import Image from "next/image";
import { Store, ShoppingBag, ArrowRight, ShieldCheck, Trash2, Plus, Minus } from "lucide-react";
import { getCarts, removeCartItem, updateCartItem, type VendorCart, type ApiCartItem } from "@/app/api/cart";

export default function CartPageClient() {
  const [vendorCarts, setVendorCarts] = useState<VendorCart[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCarts() {
    setLoading(true);
    try {
      const data = await getCarts();
      setVendorCarts(data || []);
    } catch {
      setVendorCarts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCarts();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#6C4CD8] border-t-transparent" />
        <p className="mt-4 text-[16px] font-semibold text-[#8B85A0]">Loading your shopping cart…</p>
>>>>>>> origin/main
      </div>
    );
  }

<<<<<<< HEAD
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
=======
  const totalItemsCount = vendorCarts.reduce(
    (sum, c) => sum + (c.items ? c.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0),
    0
  );

  if (!vendorCarts || vendorCarts.length === 0 || totalItemsCount === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F1EFFA] text-[#6C4CD8]">
          <ShoppingBag size={40} />
        </div>
        <h2 className="mt-6 text-[24px] font-extrabold text-[#1A1330]">Your Cart is Empty</h2>
        <p className="mt-2 text-[15px] text-[#8B85A0]">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] py-3.5 text-[16px] font-bold text-white shadow-md hover:bg-[#5B3DC0]"
        >
          Explore Products
>>>>>>> origin/main
        </Link>
      </div>
    );
  }

  const storeNames = vendorCarts.map(
    (c) => c.sellerProfile?.businessName?.trim() || c.sellerId || "Shop Owner"
  );
  const totalCartAmount = vendorCarts.reduce(
    (sum, c) => sum + (typeof c.totalPrice === "number" ? c.totalPrice : c.items.reduce((s, i) => s + (i.lineTotal || (i.unitPrice * i.quantity)), 0)),
    0
  );

  function getItemImage(item: ApiCartItem): string {
    const rawThumb = typeof item.thumbnailUri === "string"
      ? item.thumbnailUri
      : (typeof item.thumbnailUri === "object" && item.thumbnailUri?.uri
        ? item.thumbnailUri.uri
        : null);

    if (rawThumb && rawThumb.length > 5) return rawThumb;

    return item.title?.toLowerCase().includes("keyboard")
      ? "/picture/pic7.jpg"
      : item.title?.toLowerCase().includes("hoodie") || item.title?.toLowerCase().includes("dress")
      ? "/picture/pic3.jpg"
      : item.title?.toLowerCase().includes("phone")
      ? "/picture/pic1.jpg"
      : "/picture/pic4.jpg";
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="space-y-8">
      {/* Multi-Vendor Banner */}
      {vendorCarts.length > 1 && (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-amber-900 shadow-sm flex items-start gap-4">
          <Store size={26} className="shrink-0 text-amber-600 mt-1" />
          <div>
            <h2 className="text-[18px] font-extrabold text-amber-900">
              Multi-Vendor Cart ({vendorCarts.length} Different Shops)
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-amber-800">
              Your cart contains items from <strong>{vendorCarts.length} different shops</strong> ({storeNames.join(", ")}). Per Phsar Digital vendor rules, orders are checked out <strong>1 shop at a time</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Vendor Grouped Product Cards */}
        <div className="space-y-6">
          {vendorCarts.map((cart, cartIdx) => {
            const storeName = cart.sellerProfile?.businessName?.trim() || cart.sellerId || `Shop ${cartIdx + 1}`;
            const logoUri = cart.sellerProfile?.logoUri;
            const items = cart.items || [];
            const cartTotal = typeof cart.totalPrice === "number"
              ? cart.totalPrice
              : items.reduce((s, i) => s + (i.lineTotal || (i.unitPrice * i.quantity)), 0);

            return (
              <div key={cart.uuid || cartIdx} className="overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white shadow-sm">
                {/* Store Header */}
                <div className="flex items-center justify-between border-b border-[#F0EDFB] bg-[#F8F7FC] px-6 py-4">
                  <div className="flex items-center gap-3">
                    {logoUri ? (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#EDEBF3]">
                        <Image src={logoUri} alt={storeName} fill className="object-cover" unoptimized={logoUri.startsWith("http")} />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C4CD8] text-white shadow-xs">
                        <Store size={19} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-[17px] font-extrabold text-[#1A1330]">{storeName}</h3>
                      <p className="text-[12px] text-[#8B85A0]">{items.length} item{items.length > 1 ? "s" : ""} · Total: ${cartTotal.toFixed(2)}</p>
                    </div>
                  </div>

                  <Link
                    href={`/checkout`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#5B3DC0]"
                  >
                    Check Out
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#F0EDFB] p-6 space-y-4">
                  {items.map((item, itemIdx) => {
                    const img = getItemImage(item);
                    const unitPrice = item.unitPrice ?? 0;
                    const fullPrice = item.fullPrice;

                    return (
                      <div key={item.uuid || itemIdx} className="flex items-center gap-5 pt-4 first:pt-0">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F5F3FA] border border-[#EDEBF3]">
                          <Image src={img} alt={item.title || "Product"} fill className="object-cover" unoptimized={img.startsWith("http")} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.listingUuid}`} className="text-[15px] font-extrabold text-[#1A1330] hover:text-[#6C4CD8] truncate block">
                            {item.title}
                          </Link>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-[16px] font-black text-[#6C4CD8]">
                              ${unitPrice.toFixed(2)}
                            </span>
                            {fullPrice && fullPrice > unitPrice && (
                              <span className="text-[13px] font-semibold text-[#8B85A0] line-through">
                                ${fullPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Qty & Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center rounded-xl border border-[#E2DFEC] bg-white">
                            <button
                              onClick={async () => {
                                if (item.quantity > 1) {
                                  await updateCartItem(itemIdx + 1, item.quantity - 1);
                                  fetchCarts();
                                }
                              }}
                              className="px-2.5 py-1.5 text-[#6C4CD8] hover:bg-[#F1EFFA] rounded-l-xl"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-[14px] font-bold text-[#1A1330]">{item.quantity}</span>
                            <button
                              onClick={async () => {
                                await updateCartItem(itemIdx + 1, item.quantity + 1);
                                fetchCarts();
                              }}
                              className="px-2.5 py-1.5 text-[#6C4CD8] hover:bg-[#F1EFFA] rounded-r-xl"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={async () => {
                              await removeCartItem(itemIdx + 1);
                              fetchCarts();
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: General Cart Overview */}
        <div>
          <div className="sticky top-24 rounded-3xl border border-[#EDEBF3] bg-white p-7 shadow-sm space-y-6">
            <h2 className="text-[20px] font-extrabold text-[#1A1330] border-b border-[#F0EDFB] pb-4">
              Cart Overview
            </h2>

            <div className="space-y-3 text-[14px]">
              <div className="flex justify-between text-[#8B85A0]">
                <span>Total Items</span>
                <span className="font-bold text-[#1A1330]">{totalItemsCount} items</span>
              </div>
              <div className="flex justify-between text-[#8B85A0]">
                <span>Total Shops</span>
                <span className="font-bold text-[#6C4CD8]">{vendorCarts.length} shops</span>
              </div>
              <div className="border-t border-[#EDEBF3] pt-3 flex justify-between text-[18px] font-extrabold text-[#1A1330]">
                <span>Total Value</span>
                <span className="text-[22px] text-[#6C4CD8]">${totalCartAmount.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6C4CD8] py-4 text-[17px] font-bold text-white shadow-[0_8px_25px_rgba(108,76,216,0.35)] transition-all hover:scale-[1.02] hover:bg-[#5B3DC0]"
            >
              Check Out
              <ArrowRight size={18} />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[12px] font-semibold text-[#8B85A0]">
              <ShieldCheck size={16} className="text-[#6C4CD8]" />
              Phsar Digital Verified Multi-Vendor Guarantee
            </div>
          </div>
        </div>
>>>>>>> origin/main
      </div>
    </div>
  );
}
