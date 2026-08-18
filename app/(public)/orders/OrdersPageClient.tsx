"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  MessageSquare,
  RefreshCw,
  MapPin,
  ChevronRight,
  X,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  Check,
} from "lucide-react";
import type { UserOrder, OrderStatus } from "./types";
import { MOCK_USER_ORDERS } from "./mockOrders";

export default function OrdersPageClient() {
  const [orders, setOrders] = useState<UserOrder[]>(MOCK_USER_ORDERS);
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingOrder, setTrackingOrder] = useState<UserOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((c) => (c === msg ? null : c)), 3500);
  }

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeTab === "all" || order.status === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.storeName.toLowerCase().includes(q) ||
      order.items.some((i) => i.title.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs sm:text-sm font-bold text-amber-700 border border-amber-200">
            <Clock size={14} className="animate-spin" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs sm:text-sm font-bold text-blue-700 border border-blue-200">
            <Truck size={14} />
            In Transit / Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={14} />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs sm:text-sm font-bold text-rose-700 border border-rose-200">
            <X size={14} />
            Cancelled
          </span>
        );
    }
  };

  function handleReorder(order: UserOrder) {
    showToast(`Added ${order.items.length} item(s) from ${order.storeName} to your cart!`);
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#1A1330] text-white px-5 py-3.5 shadow-2xl border border-white/10"
          >
            <Check size={18} className="text-emerald-400" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col gap-4 border-b border-[#EDEBF3] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#1A1330] sm:text-4xl">My Orders</h1>
            <span className="rounded-full bg-[#6C4CD8] px-4 py-1 text-sm font-extrabold text-white shadow-sm">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>
          <p className="mt-2 text-base sm:text-lg font-medium text-[#7C7596]">
            Track shipments, review multi-vendor purchases, and request support.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, product..."
            className="w-full rounded-full border border-[#E2DFEC] bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-[#1A1330] outline-none shadow-xs transition-all focus:border-[#6C4CD8] focus:ring-2 focus:ring-[#6C4CD8]/20"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C4CD8]" />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "all", label: "All Orders", count: orders.length },
          { id: "processing", label: "Processing", count: orders.filter((o) => o.status === "processing").length },
          { id: "shipped", label: "In Transit", count: orders.filter((o) => o.status === "shipped").length },
          { id: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id as "all" | OrderStatus)}
            className={`rounded-full px-5 py-2.5 text-sm sm:text-base font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-[#6C4CD8] text-white shadow-md"
                : "bg-white border border-[#EDEBF3] text-[#1A1330] hover:bg-[#F1EFFA] hover:text-[#6C4CD8]"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#F1EFFA] text-[#6C4CD8]"
              }`}
            >
              {tab.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white shadow-sm transition-all hover:border-[#6C4CD8]/40 hover:shadow-lg"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#F0EDFB] bg-[#F8F7FB] px-6 py-4 gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-[#6C4CD8]" />
                    <span className="text-base sm:text-lg font-black text-[#1A1330]">{order.id}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-[#7C7596]">{order.date}</span>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-xs sm:text-sm font-bold text-[#6C4CD8] border border-[#EDEBF3]">
                    <ShoppingBag size={14} />
                    {order.storeName}
                  </div>
                </div>

                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Order Items List */}
              <div className="divide-y divide-[#F0EDFB] p-6 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-5 pt-4 first:pt-0">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F8F7FB] border border-[#EDEBF3]">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-base sm:text-lg font-extrabold text-[#1A1330] transition-colors hover:text-[#6C4CD8] line-clamp-1 block"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs sm:text-sm text-[#7C7596]">
                        Quantity: <span className="font-bold text-[#1A1330]">{item.quantity}</span> &nbsp;•&nbsp; Unit Price: ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-black text-[#6C4CD8]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Info & Actions Footer */}
              <div className="border-t border-[#F0EDFB] bg-[#FAFAFE] px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#7C7596]">
                    <MapPin size={15} className="text-[#6C4CD8] shrink-0" />
                    <span className="truncate max-w-md">{order.shippingAddress}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#7C7596] pl-6">
                    <span>Payment: <strong className="text-[#1A1330]">{order.paymentMethod}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-[#6C4CD8]">{order.estimatedDelivery}</strong></span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTrackingOrder(order)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#F1EFFA] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#6C4CD8] hover:bg-[#E5E0F5]"
                  >
                    <Truck size={16} />
                    Track Package
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReorder(order)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#6C4CD8] px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-[#5B3EC4]"
                  >
                    <RefreshCw size={15} />
                    Buy Again
                  </motion.button>

                  <Link href="/messages">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Contact Seller"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EDEBF3] bg-white text-[#6C4CD8] hover:bg-[#F1EFFA]"
                    >
                      <MessageSquare size={16} />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty Filter Results */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto my-12 flex max-w-md flex-col items-center justify-center rounded-3xl border border-[#EDEBF3] bg-white p-12 text-center shadow-sm"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F1EFFA] text-[#6C4CD8]">
            <Package size={36} />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1330]">No Orders Found</h2>
          <p className="mt-2 text-sm text-[#7C7596]">
            No orders match your current filter or search query.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#6C4CD8] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#5B3EC4]"
          >
            Browse Marketplace →
          </Link>
        </motion.div>
      )}

      {/* Package Tracking Timeline Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#EDEBF3] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Truck className="text-[#6C4CD8]" size={20} />
                    <h3 className="text-xl font-black text-[#1A1330]">Shipment Tracking</h3>
                  </div>
                  <p className="text-xs text-[#7C7596] mt-0.5">Order ID: {trackingOrder.id}</p>
                </div>
                <button
                  onClick={() => setTrackingOrder(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8F7FB] text-[#7C7596] hover:bg-rose-50 hover:text-rose-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Courier Details */}
              <div className="rounded-2xl bg-[#F8F7FB] p-4 border border-[#EDEBF3] space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#7C7596]">Courier Service:</span>
                  <span className="font-bold text-[#1A1330]">{trackingOrder.courier ?? "VET Express"}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#7C7596]">Tracking Code:</span>
                  <span className="font-extrabold text-[#6C4CD8]">{trackingOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#7C7596]">Estimated Delivery:</span>
                  <span className="font-bold text-emerald-600">{trackingOrder.estimatedDelivery}</span>
                </div>
              </div>

              {/* Timeline Progress */}
              <div className="space-y-6 px-2">
                {[
                  {
                    title: "Order Placed",
                    desc: "Your order was successfully recorded.",
                    time: trackingOrder.date,
                    completed: true,
                  },
                  {
                    title: "Confirmed by Vendor",
                    desc: `Packed & prepared by ${trackingOrder.storeName}`,
                    time: "Vendor confirmed",
                    completed: true,
                  },
                  {
                    title: "Handed to Courier",
                    desc: `Picked up by ${trackingOrder.courier ?? "Courier"}`,
                    time: trackingOrder.status === "shipped" || trackingOrder.status === "delivered" ? "In transit" : "Pending",
                    completed: trackingOrder.status === "shipped" || trackingOrder.status === "delivered",
                  },
                  {
                    title: "Out for Delivery",
                    desc: "Driver is on the way to recipient address.",
                    time: trackingOrder.status === "delivered" ? "Completed" : "Scheduled",
                    completed: trackingOrder.status === "delivered",
                  },
                  {
                    title: "Delivered",
                    desc: "Package delivered to shipping location.",
                    time: trackingOrder.status === "delivered" ? trackingOrder.estimatedDelivery : "Estimated",
                    completed: trackingOrder.status === "delivered",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {/* Timeline bar line */}
                    {i < 4 && (
                      <div
                        className={`absolute left-[15px] top-[28px] h-[calc(100%+8px)] w-[2px] ${
                          step.completed ? "bg-[#6C4CD8]" : "bg-[#EDEBF3]"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        step.completed
                          ? "bg-[#6C4CD8] text-white shadow-md"
                          : "bg-[#F1EFFA] text-[#7C7596] border border-[#EDEBF3]"
                      }`}
                    >
                      {step.completed ? <Check size={16} /> : i + 1}
                    </div>

                    <div className="space-y-0.5">
                      <p className={`text-sm font-extrabold ${step.completed ? "text-[#1A1330]" : "text-[#7C7596]"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-[#7C7596]">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setTrackingOrder(null)}
                className="w-full rounded-2xl bg-[#6C4CD8] py-3 text-sm font-bold text-white shadow-md hover:bg-[#5B3EC4]"
              >
                Close Tracking
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
