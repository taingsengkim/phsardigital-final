"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Store, ShoppingBag, ArrowRight, ShieldCheck, Trash2, Plus, Minus } from "lucide-react";
import { getCart, removeCartItem, updateCartItem } from "@/app/api/cart";
import type { Cart, CartItem } from "@/lib/types";

export default function CartPageClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchCart() {
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#6C4CD8] border-t-transparent" />
        <p className="mt-4 text-[16px] font-semibold text-[#8B85A0]">Loading your shopping cart…</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
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
        </Link>
      </div>
    );
  }

  // Group items by store_name
  const groupedByStore: Record<string, CartItem[]> = {};
  cart.items.forEach((item) => {
    const store = item.listing?.store_name ?? "Phsar Digital Store";
    if (!groupedByStore[store]) groupedByStore[store] = [];
    groupedByStore[store].push(item);
  });

  const storeNames = Object.keys(groupedByStore);
  const totalCartAmount = cart.items.reduce((s, i) => s + (i.listing?.price ?? 0) * i.quantity, 0);

  return (
    <div className="space-y-8">
      {/* Multi-Vendor Banner */}
      {storeNames.length > 1 && (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-amber-900 shadow-sm flex items-start gap-4">
          <Store size={26} className="shrink-0 text-amber-600 mt-1" />
          <div>
            <h2 className="text-[18px] font-extrabold text-amber-900">
              Multi-Vendor Cart ({storeNames.length} Different Shops)
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-amber-800">
              Your cart contains items from <strong>{storeNames.length} different shops</strong> ({storeNames.join(", ")}). Per Phsar Digital vendor rules, orders are checked out <strong>1 shop at a time</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Vendor Grouped Product Cards */}
        <div className="space-y-6">
          {storeNames.map((store) => {
            const storeItems = groupedByStore[store];
            const storeTotal = storeItems.reduce((s, i) => s + (i.listing?.price ?? 0) * i.quantity, 0);

            return (
              <div key={store} className="overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white shadow-sm">
                {/* Store Header */}
                <div className="flex items-center justify-between border-b border-[#F0EDFB] bg-[#F8F7FC] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C4CD8] text-white shadow-xs">
                      <Store size={18} />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-[#1A1330]">{store}</h3>
                      <p className="text-[12px] text-[#8B85A0]">{storeItems.length} item{storeItems.length > 1 ? "s" : ""}</p>
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
                  {storeItems.map((item) => {
                    const primaryImg = item.listing?.images?.find((i) => i.is_primary)?.url ?? item.listing?.images?.[0]?.url ?? "/picture/pic1.jpg";

                    return (
                      <div key={item.id} className="flex items-center gap-5 pt-4 first:pt-0">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F5F3FA] border border-[#EDEBF3]">
                          <Image src={primaryImg} alt={item.listing?.title ?? ""} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.listing?.slug}`} className="text-[15px] font-extrabold text-[#1A1330] hover:text-[#6C4CD8] truncate block">
                            {item.listing?.title}
                          </Link>
                          <p className="mt-1 text-[16px] font-black text-[#6C4CD8]">
                            ${(item.listing?.price ?? 0).toFixed(2)}
                          </p>
                        </div>

                        {/* Qty & Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center rounded-xl border border-[#E2DFEC] bg-white">
                            <button
                              onClick={async () => {
                                if (item.quantity > 1) {
                                  await updateCartItem(item.id, item.quantity - 1);
                                  fetchCart();
                                }
                              }}
                              className="px-2.5 py-1.5 text-[#6C4CD8] hover:bg-[#F1EFFA] rounded-l-xl"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-[14px] font-bold text-[#1A1330]">{item.quantity}</span>
                            <button
                              onClick={async () => {
                                await updateCartItem(item.id, item.quantity + 1);
                                fetchCart();
                              }}
                              className="px-2.5 py-1.5 text-[#6C4CD8] hover:bg-[#F1EFFA] rounded-r-xl"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={async () => {
                              await removeCartItem(item.id);
                              fetchCart();
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
                <span className="font-bold text-[#1A1330]">{cart.items.length} items</span>
              </div>
              <div className="flex justify-between text-[#8B85A0]">
                <span>Total Shops</span>
                <span className="font-bold text-[#6C4CD8]">{storeNames.length} shops</span>
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
      </div>
    </div>
  );
}
