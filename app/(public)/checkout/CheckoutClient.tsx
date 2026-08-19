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
  MapPin,
  QrCode,
  ArrowRight,
  ShoppingBag,
  Store,
  AlertTriangle,
  Home,
  Building,
  Plus,
  Check,
  MessageSquare,
  Send,
  X,
  FileText,
  Clock,
  ArrowLeft,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getListingBySlug } from "@/app/api/listings";
import { getCart, getCarts } from "@/app/api/cart";
import { createOrder } from "@/app/api/orders";
import type { Listing } from "@/lib/types";

type CheckoutItem = {
  id: number | string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
  storeName: string;
};

type SavedAddress = {
  id: string;
  label: string;
  isDefault?: boolean;
  fullName: string;
  phone: string;
  city: string;
  address: string;
};

type ChatMessage = {
  id: string;
  sender: "seller" | "buyer";
  text?: string;
  time: string;
  isInvoiceCard?: boolean;
  isQrCard?: boolean;
};

type ChatThread = {
  id: string;
  storeName: string;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
};

const INITIAL_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "home",
    label: "Home (Phnom Penh)",
    isDefault: true,
    fullName: "Vanneth Sok",
    phone: "096 888 7777",
    city: "Phnom Penh",
    address: "House #42B, Street 271, Tuol Sangkae 2, Ruessei Kaev",
  },
  {
    id: "office",
    label: "Office / Work",
    fullName: "Vanneth Sok",
    phone: "012 345 6789",
    city: "Phnom Penh",
    address: "Canadia Tower, 18th Floor, Monivong Blvd, Wat Phnom, Daun Penh",
  },
  {
    id: "siem_reap",
    label: "Siem Reap House",
    fullName: "Vanneth Sok",
    phone: "096 888 7777",
    city: "Siem Reap",
    address: "House #12, National Road 06, Svay Dangkum",
  },
];

const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: "t1",
    storeName: "TechHub KH",
    lastMessage: "Invoice status updated to PAID & VERIFIED!",
    lastTime: "10:17 AM",
    unreadCount: 0,
  },
  {
    id: "t2",
    storeName: "Van Shop",
    lastMessage: "Your Fitbit Versa 4 smartwatch is dispatched!",
    lastTime: "Yesterday",
    unreadCount: 1,
  },
  {
    id: "t3",
    storeName: "Fashion By Srey",
    lastMessage: "Thank you for confirming your delivery location.",
    lastTime: "Aug 15",
    unreadCount: 0,
  },
  {
    id: "t4",
    storeName: "Sneaker World",
    lastMessage: "Please check your ABA / KHQR receipt slip.",
    lastTime: "Aug 12",
    unreadCount: 0,
  },
  {
    id: "t5",
    storeName: "Leather Craft Co.",
    lastMessage: "Welcome to Leather Craft Co.! How can we help?",
    lastTime: "Aug 08",
    unreadCount: 0,
  },
  {
    id: "t6",
    storeName: "Angkor Artisan Crafts",
    lastMessage: "Handcrafted stone carving items are packed.",
    lastTime: "Aug 05",
    unreadCount: 2,
  },
  {
    id: "t7",
    storeName: "Phnom Penh Tech Market",
    lastMessage: "Thank you for buying 5G Dual SIM Phone!",
    lastTime: "Aug 01",
    unreadCount: 0,
  },
  {
    id: "t8",
    storeName: "Khmer Silk & Fashion",
    lastMessage: "Your traditional Khmer silk dress order is complete.",
    lastTime: "Jul 28",
    unreadCount: 0,
  },
  {
    id: "t9",
    storeName: "Siem Reap Souvenir Hub",
    lastMessage: "Order delivered safely to Siem Reap House.",
    lastTime: "Jul 20",
    unreadCount: 0,
  },
  {
    id: "t10",
    storeName: "Battambang Organic Market",
    lastMessage: "Fresh organic dried fruit package sent!",
    lastTime: "Jul 14",
    unreadCount: 0,
  },
  {
    id: "t11",
    storeName: "Kampot Pepper Official",
    lastMessage: "Organic black pepper shipment processed.",
    lastTime: "Jul 10",
    unreadCount: 0,
  },
  {
    id: "t12",
    storeName: "Kep Seafood Express",
    lastMessage: "Fresh crab package arrives in Phnom Penh at 4 PM.",
    lastTime: "Jul 02",
    unreadCount: 1,
  },
  {
    id: "t13",
    storeName: "Mekong Craft Store",
    lastMessage: "Handmade bamboo lanterns shipped.",
    lastTime: "Jun 25",
    unreadCount: 0,
  },
  {
    id: "t14",
    storeName: "Ratanakiri Gemstones",
    lastMessage: "Custom gemstone ring certificate attached.",
    lastTime: "Jun 18",
    unreadCount: 0,
  },
  {
    id: "t15",
    storeName: "Koh Kong Electronics",
    lastMessage: "Warranty card uploaded for your Bluetooth speaker.",
    lastTime: "Jun 10",
    unreadCount: 0,
  },
];

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const slugParam = searchParams.get("slug");
  const qtyParam = searchParams.get("qty");

  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Workflow Stage Control: "form" | "invoice_success" | "full_chat_page"
  const [stage, setStage] = useState<"form" | "invoice_success" | "full_chat_page">("form");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<{ id: number; total: number; storeName: string } | null>(null);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(INITIAL_SAVED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("home");

  // Form Input State
  const [fullName, setFullName] = useState("Vanneth Sok");
  const [phone, setPhone] = useState("096 888 7777");
  const [city, setCity] = useState("Phnom Penh");
  const [address, setAddress] = useState("House #42B, Street 271, Tuol Sangkae 2, Ruessei Kaev");
  const [paymentMethod, setPaymentMethod] = useState<"pay_now_shop" | "cod">("pay_now_shop");

  // New location options
  const [newLabel, setNewLabel] = useState("");
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  // Chat message & threads state
  const [chatInput, setChatInput] = useState("");
  const [searchChat, setSearchChat] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(INITIAL_CHAT_THREADS);
  const [activeChatStore, setActiveChatStore] = useState<string>("");

  useEffect(() => {
    async function loadCheckoutData() {
      setLoading(true);
      try {
        const vendorCarts = await getCarts();
        let mappedItems: CheckoutItem[] = [];

        if (vendorCarts && Array.isArray(vendorCarts) && vendorCarts.length > 0) {
          vendorCarts.forEach((cart, cartIdx) => {
            const storeName = cart.sellerId
              ? cart.sellerId.length > 20
                ? `Shop #${cart.sellerId.slice(0, 6)}`
                : cart.sellerId
              : `Shop ${cartIdx + 1}`;

            if (cart.items && Array.isArray(cart.items)) {
              cart.items.forEach((item, itemIdx) => {
                const img = item.title?.toLowerCase().includes("keyboard")
                  ? "/picture/pic7.jpg"
                  : item.title?.toLowerCase().includes("hoodie") || item.title?.toLowerCase().includes("dress")
                  ? "/picture/pic3.jpg"
                  : item.title?.toLowerCase().includes("phone")
                  ? "/picture/pic1.jpg"
                  : `/picture/pic${(itemIdx % 7) + 1}.jpg`;

                mappedItems.push({
                  id: item.uuid || item.listingUuid,
                  title: item.title || "Product Item",
                  price: item.unitPrice ?? 0,
                  quantity: item.quantity ?? 1,
                  image: img,
                  slug: item.listingUuid,
                  storeName,
                });
              });
            }
          });
        }

        // Fallback if vendorCarts was empty
        if (mappedItems.length === 0) {
          const singleCart = await getCart();
          if (singleCart && singleCart.items && singleCart.items.length > 0) {
            mappedItems = singleCart.items.map((item) => ({
              id: item.listing_id,
              title: item.listing?.title ?? "Product Item",
              price: item.listing?.price ?? 0,
              quantity: item.quantity,
              image: item.listing?.images?.[0]?.url ?? "/picture/pic1.jpg",
              slug: item.listing?.slug,
              storeName: item.listing?.store_name ?? "TechHub KH",
            }));
          }
        }

        if (slugParam) {
          const parsedQty = Math.max(1, parseInt(qtyParam ?? "1", 10));
          const existing = mappedItems.find((i) => i.slug === slugParam);

          if (existing) {
            existing.quantity = Math.max(existing.quantity, parsedQty);
          } else {
            const listing: Listing = await getListingBySlug(slugParam);
            const primaryImg =
              listing.images?.find((img) => img.is_primary)?.url ??
              listing.images?.[0]?.url ??
              "/picture/pic1.jpg";

            mappedItems.unshift({
              id: listing.id,
              title: listing.title,
              price: listing.price,
              quantity: parsedQty,
              image: primaryImg,
              slug: listing.slug,
              storeName: listing.store_name ?? "TechHub KH",
            });
          }
        }

        if (mappedItems.length === 0) {
          mappedItems = [
            {
              id: 101,
              title: "Wireless Mechanical Keyboard",
              price: 89.99,
              quantity: 7,
              image: "/picture/pic7.jpg",
              slug: "ac364012-6788-4df9-baf9-a7815753d9c1",
              storeName: "TechHub KH",
            },
            {
              id: 102,
              title: "ISTAD Friends Hoodie",
              price: 25.0,
              quantity: 5,
              image: "/picture/pic3.jpg",
              slug: "a99cbb20-21a9-4349-ab9f-30e1b6aff5c4",
              storeName: "TechHub KH",
            },
            {
              id: 103,
              title: "Cats Accessories Pack",
              price: 12.0,
              quantity: 2,
              image: "/picture/pic4.jpg",
              slug: "3cd9eca1-520a-4314-afba-7d238cff1301",
              storeName: "Van Shop",
            },
          ];
        }

        setItems(mappedItems);

        // Select initial store
        if (slugParam) {
          const target = mappedItems.find((i) => i.slug === slugParam);
          if (target) {
            setSelectedStore(target.storeName);
            setActiveChatStore(target.storeName);
          } else {
            setSelectedStore(mappedItems[0].storeName);
            setActiveChatStore(mappedItems[0].storeName);
          }
        } else {
          setSelectedStore(mappedItems[0].storeName);
          setActiveChatStore(mappedItems[0].storeName);
        }
      } catch {
        setError("Failed to load checkout details.");
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [slugParam, qtyParam]);

  // Handle choosing a saved address
  function handleSelectSavedAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setCity(addr.city);
    setAddress(addr.address);
  }

  // Handle clicking + Add New Location
  function handleAddNewAddressClick() {
    setSelectedAddressId("new");
    setFullName("Vanneth Sok");
    setPhone("096 888 7777");
    setCity("Phnom Penh");
    setAddress("");
    setNewLabel("New Location");
  }

  // Group items by store
  const allStores = Array.from(new Set(items.map((i) => i.storeName)));

  // Filter items for currently selected store
  const activeItems = items.filter((i) => i.storeName === (selectedStore || allStores[0]));

  // Price calculations for active store
  const subtotal = activeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = subtotal > 150 ? 10 : 0;
  const shippingFee = subtotal >= 50 ? 0 : 1.5;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Step 1: Open Confirmation Popup Modal
  function handleInitiateCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim() || !phone.trim() || !fullName.trim()) {
      setError("Please fill in all required shipping details.");
      return;
    }
    if (!selectedStore) {
      setError("Please select a shop to checkout.");
      return;
    }
    setError(null);
    setShowConfirmModal(true);
  }

  // Step 2: Confirm Order & Issue Invoice to Seller
  async function handleConfirmOrder() {
    setShowConfirmModal(false);
    setSubmitting(true);

    // Save new location if requested
    if (selectedAddressId === "new" && saveNewAddress && address.trim()) {
      const createdAddr: SavedAddress = {
        id: `addr_${Date.now()}`,
        label: newLabel.trim() || "Saved Location",
        fullName: fullName.trim(),
        phone: phone.trim(),
        city,
        address: address.trim(),
      };
      setSavedAddresses((prev) => [...prev, createdAddr]);
      setSelectedAddressId(createdAddr.id);
    }

    try {
      const order = await createOrder({
        shipping_address: `${fullName} (${phone}) - ${address}, ${city}`,
        payment_method: paymentMethod,
        items: activeItems.map((i) => ({
          listing_id: typeof i.id === "number" ? i.id : parseInt(String(i.id), 10) || 101,
          quantity: i.quantity,
          unit_price: i.price,
        })),
      });

      const store = selectedStore;
      setOrderCompleted({ id: order.id, total: grandTotal, storeName: store });
      setActiveChatStore(store);

      // Update chat threads list with newly created order thread
      setChatThreads((prev) => {
        const exists = prev.some((t) => t.storeName === store);
        if (exists) {
          return prev.map((t) =>
            t.storeName === store
              ? { ...t, lastMessage: `Invoice #ORD-${order.id} created`, lastTime: "10:14 AM" }
              : t
          );
        }
        return [
          {
            id: `t_${Date.now()}`,
            storeName: store,
            lastMessage: `Invoice #ORD-${order.id} created`,
            lastTime: "10:14 AM",
          },
          ...prev,
        ];
      });

      // Pre-load static purchase & confirmation invoice conversation exchange
      setChatMessages([
        {
          id: "m1",
          sender: "buyer",
          isInvoiceCard: true,
          time: "10:14 AM",
        },
        {
          id: "m2",
          sender: "seller",
          text: `Hello ${fullName}! Invoice #ORD-${order.id} has been received and confirmed by ${store}.`,
          isQrCard: paymentMethod === "pay_now_shop",
          time: "10:15 AM",
        },
        {
          id: "m3",
          sender: "buyer",
          text: paymentMethod === "pay_now_shop"
            ? `📷 [Payment Receipt Slip Attached: $${grandTotal.toFixed(2)} via ABA PAY KHQR]`
            : `Confirmed! I will be available at ${phone} for delivery.`,
          time: "10:16 AM",
        },
        {
          id: "m4",
          sender: "seller",
          text: `Invoice status updated to PAID & VERIFIED! Your order is being dispatched via Express Delivery (Tracking #EX-94820). Thank you for shopping with ${store}!`,
          time: "10:17 AM",
        },
      ]);

      // Move to Stage 2: Invoice Sent Success Screen
      setStage("invoice_success");
    } catch {
      setError("Failed to process invoice. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Sending Chat Message
  function handleSendMessage(textToSend?: string) {
    const text = textToSend ?? chatInput;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "buyer",
      text,
      time: "Just now",
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setChatInput("");

    const targetStore = activeChatStore || selectedStore || "Shop Owner";

    // Auto-reply from seller
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_reply_${Date.now()}`,
          sender: "seller",
          text: `Received! Thank you, ${fullName}. Your order with ${targetStore} is being processed.`,
          time: "Just now",
        },
      ]);
    }, 1200);
  }

  // Switch chat thread when clicking shop on left sidebar
  function handleSelectChatThread(threadStore: string) {
    setActiveChatStore(threadStore);
    if (threadStore !== selectedStore) {
      setChatMessages([
        {
          id: "old_m1",
          sender: "buyer",
          text: `Hello ${threadStore}! I have a question regarding my order.`,
          time: "Yesterday",
        },
        {
          id: "old_m2",
          sender: "seller",
          text: `Hello ${fullName}! Thank you for reaching out to ${threadStore}. Your package has been dispatched and is on its way!`,
          time: "Yesterday",
        },
      ]);
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#6C4CD8] border-t-transparent" />
        <p className="mt-4 text-[16px] font-semibold text-[#8B85A0]">Preparing checkout details…</p>
      </div>
    );
  }

  // ── STAGE 2: INVOICE SENT SUCCESS SCREEN WITH "CHAT WITH SELLER" BUTTON ──
  if (stage === "invoice_success" && orderCompleted) {
    const remainingStores = allStores.filter((s) => s !== orderCompleted.storeName);

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_32px_rgba(108,76,216,0.12)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={44} />
          </div>
          <h1 className="mt-6 text-[28px] font-black text-[#1A1330]">Invoice Sent to {orderCompleted.storeName}!</h1>
          <p className="mt-2 text-[15px] text-[#8B85A0]">
            Your order invoice <span className="font-bold text-[#6C4CD8]">#ORD-{orderCompleted.id}</span> has been issued. You can now chat directly with <span className="font-bold text-[#1A1330]">{orderCompleted.storeName}</span> to finalize payment and delivery.
          </p>

          {/* Interactive Progress Tracker */}
          <div className="my-8 grid grid-cols-4 gap-2 rounded-2xl bg-[#F6F5FA] p-4 text-center text-[12px] font-bold">
            <div className="flex flex-col items-center text-emerald-600">
              <CheckCircle2 size={20} className="mb-1" />
              <span>1. Invoice Sent</span>
            </div>
            <div className="flex flex-col items-center text-[#6C4CD8]">
              <MessageSquare size={20} className="mb-1 animate-bounce" />
              <span>2. Chat Seller</span>
            </div>
            <div className="flex flex-col items-center text-[#8B85A0]">
              <Truck size={20} className="mb-1 opacity-50" />
              <span>3. Dispatch</span>
            </div>
            <div className="flex flex-col items-center text-[#8B85A0]">
              <Clock size={20} className="mb-1 opacity-50" />
              <span>4. Complete</span>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="my-6 rounded-2xl border border-[#EDEBF3] p-5 text-left text-[14px] space-y-2.5">
            <div className="flex justify-between border-b border-[#F0EDFB] pb-2 font-bold text-[#1A1330]">
              <span className="flex items-center gap-1.5"><FileText size={16} className="text-[#6C4CD8]" /> Invoice #ORD-{orderCompleted.id}</span>
              <span className="text-[#6C4CD8]">${orderCompleted.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#8B85A0]">
              <span>Merchant / Shop</span>
              <span className="font-bold text-[#1A1330]">{orderCompleted.storeName}</span>
            </div>
            <div className="flex justify-between text-[#8B85A0]">
              <span>Payment Option</span>
              <span className="font-semibold text-[#1A1330]">
                {paymentMethod === "pay_now_shop" ? "Pay Now with Shop (KHQR)" : "Cash on Delivery (COD)"}
              </span>
            </div>
            <div className="flex justify-between text-[#8B85A0]">
              <span>Delivery Address</span>
              <span className="font-medium text-right text-[#1A1330] max-w-[220px] truncate">{address}, {city}</span>
            </div>
          </div>

          {/* Chat with Seller Button → Opens Full Page Chat Portal */}
          <button
            onClick={() => setStage("full_chat_page")}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#6C4CD8] py-4 text-[17px] font-bold text-white shadow-[0_8px_25px_rgba(108,76,216,0.35)] transition hover:bg-[#5B3DC0]"
          >
            <MessageSquare size={20} />
            Chat with {orderCompleted.storeName}
          </button>

          {remainingStores.length > 0 && (
            <div className="mt-6 rounded-2xl bg-purple-50 border border-purple-200 p-5 text-left text-purple-900">
              <p className="text-[14px] font-bold">🛒 Next Shop Order: {remainingStores.join(", ")}</p>
              <p className="mt-1 text-[13px] text-purple-700">
                Per multi-vendor policy, please proceed to checkout for your next shop.
              </p>
              <button
                onClick={() => {
                  setStage("form");
                  setOrderCompleted(null);
                  setSelectedStore(remainingStores[0]);
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm hover:bg-[#5B3DC0]"
              >
                Checkout for {remainingStores[0]}
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          <Link
            href="/products"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F1EFFA] py-3.5 text-[15px] font-bold text-[#6C4CD8] transition hover:bg-[#E2DFEC]"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── STAGE 3: FIXED FULL-SCREEN CHAT APP (NO FOOTER SCROLL & FULLY VISIBLE WRITE BAR) ──
  if (stage === "full_chat_page" && orderCompleted) {
    const currentStoreName = activeChatStore || orderCompleted.storeName;
    const filteredThreads = chatThreads.filter((t) =>
      t.storeName.toLowerCase().includes(searchChat.toLowerCase())
    );

    return (
      <div className="fixed inset-x-0 bottom-0 top-[108px] z-40 bg-[#F6F5FA] p-4 md:p-6 flex flex-col overflow-hidden">
        {/* FULL PAGE FLOATING CHAT APP CONTAINER */}
        <div className="flex flex-col md:flex-row flex-1 h-full overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white shadow-[0_12px_40px_rgba(26,19,48,0.08)] w-full">
          {/* ── LEFT SIDEBAR: SHOP CHATS LIST WITH SMOOTH SCROLL ── */}
          <div className="w-full md:w-[320px] shrink-0 flex flex-col border-r border-[#EDEBF3] bg-white h-full overflow-hidden">
            {/* Sidebar Header */}
            <div className="border-b border-[#F0EDFB] bg-[#F8F7FC] p-4 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#1A1330]">
                  <MessageSquare size={18} className="text-[#6C4CD8]" />
                  <h3 className="text-[16px] font-extrabold">Shop Chats</h3>
                </div>
                <span className="rounded-full bg-[#6C4CD8] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                  {chatThreads.length}
                </span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#8B85A0]" />
                <input
                  type="text"
                  value={searchChat}
                  onChange={(e) => setSearchChat(e.target.value)}
                  placeholder="Search shops or chats…"
                  className="w-full rounded-xl border border-[#E2DFEC] bg-white pl-8 pr-3 py-1.5 text-[12px] text-[#1A1330] outline-none focus:border-[#6C4CD8]"
                />
              </div>
            </div>

            {/* Chat Threads List — 10 Shops with Sleek Scrollbar */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F0EDFB] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-200/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-400">
              {filteredThreads.map((thread) => {
                const isActive = thread.storeName === currentStoreName;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectChatThread(thread.storeName)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 p-4 transition-all",
                      isActive
                        ? "bg-[#F3F0FC] border-l-4 border-[#6C4CD8]"
                        : "hover:bg-[#F8F7FC]"
                    )}
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#6C4CD8] font-bold text-white shadow-xs">
                      <Store size={18} />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-[13.5px] truncate", isActive ? "font-black text-[#6C4CD8]" : "font-bold text-[#1A1330]")}>
                          {thread.storeName}
                        </p>
                        <span className="text-[10px] text-[#8B85A0] shrink-0 ml-1">{thread.lastTime}</span>
                      </div>
                      <p className="text-[11.5px] text-[#8B85A0] truncate mt-0.5">
                        {thread.storeName === orderCompleted.storeName && isActive
                          ? `Invoice #ORD-${orderCompleted.id} created`
                          : thread.lastMessage}
                      </p>
                    </div>

                    {thread.unreadCount && thread.unreadCount > 0 ? (
                      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                        {thread.unreadCount}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT MAIN CHAT AREA (EXPANDED TO FULL RIGHT BOUNDARY WITH SLEEK FLUSH SCROLLBAR) ── */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F7FC] w-full">
            {/* Active Chat Header */}
            <div className="flex items-center justify-between border-b border-[#EDEBF3] bg-white px-8 py-4 shrink-0 w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6C4CD8] text-white font-extrabold text-[18px] shadow-xs">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="text-[18px] font-extrabold text-[#1A1330]">{currentStoreName}</h3>
                  <p className="text-[12.5px] text-[#8B85A0] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Online Official Merchant · Response Rate: 99%
                  </p>
                </div>
              </div>

              <span className="rounded-xl bg-emerald-100 px-3.5 py-1.5 text-[12.5px] font-extrabold text-emerald-700">
                Direct Seller Line
              </span>
            </div>

            {/* MESSAGES BODY WITH SLEEK FLUSH SCROLLBAR (NO WHITE SPACE GAP) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-300/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-500/80">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.sender === "buyer" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  {/* Detailed Invoice Card Bubble */}
                  {msg.isInvoiceCard ? (
                    <div className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm text-[#1A1330] space-y-3.5 w-full max-w-lg">
                      <div className="flex items-center justify-between border-b border-[#F0EDFB] pb-3">
                        <div className="flex items-center gap-2 text-[#6C4CD8]">
                          <FileText size={20} />
                          <span className="text-[14px] font-extrabold uppercase tracking-wide">Purchase Invoice Ticket</span>
                        </div>
                        <span className="rounded-md bg-[#6C4CD8] px-2.5 py-1 text-[12px] font-bold text-white">
                          #ORD-{orderCompleted.id}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 py-1">
                        {activeItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-[13.5px]">
                            <span className="font-bold text-[#1A1330] truncate max-w-[280px]">{item.title} (x{item.quantity})</span>
                            <span className="font-extrabold text-[#6C4CD8]">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#F0EDFB] pt-3 text-[12.5px] text-[#8B85A0] space-y-1">
                        <p><strong>Deliver To:</strong> {fullName} ({phone})</p>
                        <p><strong>Address:</strong> {address}, {city}</p>
                        <p><strong>Payment Option:</strong> {paymentMethod === "pay_now_shop" ? "Pay Now (KHQR)" : "Cash on Delivery"}</p>
                      </div>

                      <div className="border-t border-[#EDEBF3] pt-3 flex justify-between font-extrabold text-[16px] text-[#1A1330]">
                        <span>Total Invoice Amount</span>
                        <span className="text-[#6C4CD8] text-[18px]">${orderCompleted.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "rounded-2xl p-4.5 text-[15px] leading-relaxed shadow-xs space-y-3",
                        msg.sender === "buyer"
                          ? "bg-[#6C4CD8] text-white rounded-tr-none"
                          : "bg-white text-[#1A1330] rounded-tl-none border border-[#EDEBF3]"
                      )}
                    >
                      <p>{msg.text}</p>

                      {/* Inline KHQR Scan Code inside Seller Response */}
                      {msg.isQrCard && (
                        <div className="mt-3 rounded-2xl border border-purple-200 bg-[#F8F7FC] p-5 text-center shadow-xs">
                          <p className="text-[13px] font-extrabold text-[#6C4CD8] uppercase tracking-wide">
                            ABA PAY / KHQR Code for {currentStoreName}
                          </p>
                          <div className="my-3 mx-auto h-40 w-40 relative rounded-2xl bg-white p-3 border border-purple-200 flex items-center justify-center">
                            <QrCode size={115} className="text-[#6C4CD8]" />
                          </div>
                          <p className="text-[12.5px] text-[#8B85A0]">Scan with ABA, ACLEDA, Wing, or any KHQR banking app</p>
                        </div>
                      )}
                    </div>
                  )}

                  <span className="mt-1 text-[11px] text-[#8B85A0]">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="border-t border-[#EDEBF3] bg-white p-5 shrink-0 w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3 w-full"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Type your message to ${currentStoreName}…`}
                  className="flex-1 rounded-2xl border border-[#E2DFEC] bg-[#F6F5FA] px-6 py-4 text-[15px] text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#6C4CD8] text-white shadow-md hover:bg-[#5B3DC0] transition"
                >
                  <Send size={22} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STAGE 1: CHECKOUT FORM VIEW ──
  return (
    <div>
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="mb-6">
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

      {/* ── Multi-Vendor Notice & Store Selector ── */}
      {allStores.length > 1 && (
        <div className="mb-8 rounded-3xl bg-amber-50/90 border border-amber-200 p-6 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h2 className="text-[17px] font-extrabold text-amber-900">
                Multi-Vendor Order Notice ({allStores.length} Different Shops)
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-amber-800">
                Your cart contains items from <strong>{allStores.length} different shops</strong> ({allStores.join(", ")}). Per Phsar Digital vendor policy, orders are completed <strong>1 shop at a time</strong> so payment and delivery are handled directly with each shop owner.
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-amber-200/70 pt-4">
            <p className="text-[13px] font-bold uppercase tracking-wide text-amber-800 mb-2.5">
              Select Shop To Checkout Now:
            </p>
            <div className="flex flex-wrap gap-3">
              {allStores.map((store) => {
                const count = items.filter((i) => i.storeName === store).length;
                const isSelected = selectedStore === store;
                return (
                  <button
                    key={store}
                    type="button"
                    onClick={() => setSelectedStore(store)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-2xl px-5 py-3 text-[14px] font-bold transition-all",
                      isSelected
                        ? "bg-[#6C4CD8] text-white shadow-md scale-[1.02]"
                        : "bg-white text-[#3F3A52] border border-amber-300 hover:bg-amber-100/60"
                    )}
                  >
                    <Store size={16} />
                    <span>{store}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-extrabold",
                        isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {count} item{count > 1 ? "s" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleInitiateCheckout}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]">
          {/* ── LEFT COLUMN: Shipping & Payment ── */}
          <div className="space-y-8">
            {/* Delivery Address Section with Saved Locations */}
            <section className="rounded-3xl border border-[#EDEBF3] bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#F0EDFB] pb-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1EFFA] text-[#6C4CD8]">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="text-[20px] font-extrabold text-[#1A1330]">Delivery Address</h2>
                  <p className="text-[13px] text-[#8B85A0]">Select a saved location or enter a new shipping address</p>
                </div>
              </div>

              {/* ── SAVED LOCATION SELECTOR CARDS ── */}
              <div className="mb-6">
                <label className="mb-2.5 block text-[13px] font-extrabold text-[#1A1330] uppercase tracking-wide">
                  Saved Locations
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={cn(
                          "relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-3.5 transition-all",
                          isSelected
                            ? "border-[#6C4CD8] bg-[#F8F7FC] shadow-sm"
                            : "border-[#EDEBF3] bg-white hover:border-[#C4B5FD]"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13.5px] font-extrabold text-[#1A1330] flex items-center gap-1.5 truncate">
                            {addr.id === "home" ? <Home size={14} className="text-[#6C4CD8] shrink-0" /> : <Building size={14} className="text-[#6C4CD8] shrink-0" />}
                            <span className="truncate">{addr.label}</span>
                          </span>
                          {isSelected && (
                            <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#6C4CD8] text-white">
                              <Check size={11} />
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-[#8B85A0] line-clamp-2 leading-tight">
                          {addr.address}, {addr.city}
                        </p>
                      </div>
                    );
                  })}

                  {/* Add New Location Card */}
                  <div
                    onClick={handleAddNewAddressClick}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3.5 text-center transition-all",
                      selectedAddressId === "new"
                        ? "border-[#6C4CD8] bg-[#F8F7FC] text-[#6C4CD8]"
                        : "border-[#DCD7EC] bg-white text-[#8B85A0] hover:border-[#6C4CD8] hover:text-[#6C4CD8]"
                    )}
                  >
                    <Plus size={16} />
                    <span className="text-[13px] font-bold">+ New Location</span>
                  </div>
                </div>
              </div>

              {/* ── ADDRESS FORM FIELDS ── */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-4 border-t border-[#F0EDFB]">
                {selectedAddressId === "new" && (
                  <div className="sm:col-span-2">
                    <label htmlFor="newLabel" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                      Location Label (e.g. Condo, Parents' House) *
                    </label>
                    <input
                      id="newLabel"
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Enter label name"
                      className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                    />
                  </div>
                )}

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

                {selectedAddressId === "new" && (
                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      id="saveNewAddress"
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      className="h-4 w-4 accent-[#6C4CD8]"
                    />
                    <label htmlFor="saveNewAddress" className="text-[13px] font-semibold text-[#1A1330] cursor-pointer">
                      Save this location to my saved addresses for future checkouts
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* Payment Options Section — Multi-Vendor Direct Settlement */}
            <section className="rounded-3xl border border-[#EDEBF3] bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#F0EDFB] pb-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1EFFA] text-[#6C4CD8]">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-[20px] font-extrabold text-[#1A1330]">Payment Option</h2>
                  <p className="text-[13px] text-[#8B85A0]">Settled directly with {selectedStore || "shop owner"} or delivery</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "pay_now_shop",
                    title: `Pay Now with Shop (${selectedStore || "Shop Owner"})`,
                    sub: "Scan KHQR & pay directly to store owner's mobile banking account",
                    Icon: QrCode,
                    badge: "Direct KHQR",
                  },
                  {
                    id: "cod",
                    title: "Cash on Delivery (COD)",
                    sub: "Pay cash directly to delivery person upon package arrival",
                    Icon: Truck,
                  },
                ].map(({ id, title, sub, Icon, badge }) => (
                  <label
                    key={id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4.5 transition-all",
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
                        onChange={() => setPaymentMethod(id as "pay_now_shop" | "cod")}
                        className="h-5 w-5 accent-[#6C4CD8]"
                      />
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-xs text-[#6C4CD8]">
                        <Icon size={22} />
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
                        <p className="text-[13px] text-[#8B85A0] mt-0.5">{sub}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN: Order Summary (Selected Vendor Only) ── */}
          <div>
            <div className="sticky top-24 rounded-3xl border border-[#EDEBF3] bg-white p-7 shadow-[0_4px_24px_rgba(108,76,216,0.08)] space-y-6">
              <div className="border-b border-[#F0EDFB] pb-4">
                <div className="flex items-center gap-2 text-[#6C4CD8]">
                  <Store size={18} />
                  <span className="text-[13px] font-extrabold uppercase tracking-wide">
                    {selectedStore || "Vendor Order"}
                  </span>
                </div>
                <h2 className="text-[20px] font-extrabold text-[#1A1330] mt-1">
                  Order Summary
                </h2>
              </div>

              {/* Items List for Selected Vendor */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {activeItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#1A1330] border border-[#2D2644] flex items-center justify-center text-white shadow-xs">
                      <ShoppingBag size={24} className="text-[#6C4CD8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1A1330] truncate">{item.title}</p>
                      <p className="text-[12px] text-[#8B85A0]">
                        Sold by <span className="font-semibold text-[#6C4CD8]">{item.storeName}</span> · Qty: {item.quantity}
                      </p>
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
                  <span>Subtotal ({activeItems.length} item{activeItems.length > 1 ? "s" : ""})</span>
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
                  <span>Total for {selectedStore}</span>
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
                disabled={submitting || activeItems.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6C4CD8] py-4 text-[17px] font-bold text-white shadow-[0_8px_25px_rgba(108,76,216,0.35)] transition-all hover:scale-[1.02] hover:bg-[#5B3DC0] disabled:opacity-50"
              >
                {submitting ? (
                  "Processing Order..."
                ) : (
                  <>
                    Check Out
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-2 pt-2 text-[12px] font-semibold text-[#8B85A0]">
                <ShieldCheck size={16} className="text-[#6C4CD8]" />
                Multi-Vendor Verified Direct Settlement
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── STEP 1: CONFIRMATION POPUP MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#F0EDFB] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1EFFA] text-[#6C4CD8]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-[18px] font-extrabold text-[#1A1330]">Confirm Order &amp; Invoice</h3>
                  <p className="text-[13px] text-[#8B85A0]">Send order request ticket to {selectedStore}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl p-1 text-[#8B85A0] hover:bg-[#F6F5FA]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Order Summary */}
            <div className="rounded-2xl bg-[#F6F5FA] p-5 space-y-3 text-[14px]">
              <div className="flex justify-between font-bold text-[#1A1330]">
                <span>Merchant / Shop</span>
                <span className="text-[#6C4CD8]">{selectedStore}</span>
              </div>
              <div className="flex justify-between text-[#8B85A0]">
                <span>Items ({activeItems.length})</span>
                <span className="font-semibold text-[#1A1330]">{activeItems.map((i) => i.title).join(", ")}</span>
              </div>
              <div className="flex justify-between text-[#8B85A0]">
                <span>Delivery Location</span>
                <span className="font-semibold text-right text-[#1A1330] max-w-[200px] truncate">{address}, {city}</span>
              </div>
              <div className="flex justify-between text-[#8B85A0]">
                <span>Payment Option</span>
                <span className="font-semibold text-[#1A1330]">
                  {paymentMethod === "pay_now_shop" ? "Pay Now with Shop (KHQR)" : "Cash on Delivery (COD)"}
                </span>
              </div>
              <div className="border-t border-[#E2DFEC] pt-2 flex justify-between font-extrabold text-[16px] text-[#1A1330]">
                <span>Total Amount</span>
                <span className="text-[#6C4CD8]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[13px] text-[#8B85A0] leading-relaxed">
              By confirming, your order invoice will be generated and sent directly to <strong>{selectedStore}</strong>. You can then chat with the seller to complete payment or delivery arrangements.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border border-[#E2DFEC] py-3.5 text-[15px] font-bold text-[#3F3A52] hover:bg-[#F6F5FA]"
              >
                Cancel / Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="flex-1 rounded-xl bg-[#6C4CD8] py-3.5 text-[15px] font-bold text-white shadow-md hover:bg-[#5B3DC0]"
              >
                Confirm &amp; Send Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
