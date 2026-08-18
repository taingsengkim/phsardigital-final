"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Store,
  Send,
  FileText,
  QrCode,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: "t1",
    storeName: "Sneaker World",
    lastMessage: "Invoice #ORD-95508 has been received and confirmed.",
    lastTime: "10:14 AM",
    unreadCount: 0,
  },
  {
    id: "t2",
    storeName: "TechHub KH",
    lastMessage: "Invoice status updated to PAID & VERIFIED!",
    lastTime: "10:17 AM",
    unreadCount: 0,
  },
  {
    id: "t3",
    storeName: "Van Shop",
    lastMessage: "Your Fitbit Versa 4 smartwatch is dispatched!",
    lastTime: "Yesterday",
    unreadCount: 1,
  },
  {
    id: "t4",
    storeName: "Fashion By Srey",
    lastMessage: "Thank you for confirming your delivery location.",
    lastTime: "Aug 15",
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

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  "Sneaker World": [
    {
      id: "m1",
      sender: "buyer",
      isInvoiceCard: true,
      time: "10:14 AM",
    },
    {
      id: "m2",
      sender: "seller",
      text: "Hello Vanneth Sok! Invoice #ORD-95508 has been received and confirmed by Sneaker World.",
      isQrCard: true,
      time: "10:15 AM",
    },
    {
      id: "m3",
      sender: "buyer",
      text: "📷 [Payment Receipt Slip Attached: $518.00 via ABA PAY KHQR]",
      time: "10:16 AM",
    },
    {
      id: "m4",
      sender: "seller",
      text: "Invoice status updated to PAID & VERIFIED! Your order is being dispatched via Express Delivery (Tracking #EX-94820). Thank you for shopping with Sneaker World!",
      time: "10:17 AM",
    },
  ],
};

export default function MessagesClient() {
  const [chatThreads] = useState<ChatThread[]>(INITIAL_CHAT_THREADS);
  const [activeStore, setActiveStore] = useState<string>("Sneaker World");
  const [searchChat, setSearchChat] = useState("");
  const [chatInput, setChatInput] = useState("");

  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);

  const filteredThreads = chatThreads.filter((t) =>
    t.storeName.toLowerCase().includes(searchChat.toLowerCase())
  );

  const currentMessages = messagesMap[activeStore] || [
    {
      id: "default_1",
      sender: "buyer",
      text: `Hello ${activeStore}! I have a question regarding my order.`,
      time: "Yesterday",
    },
    {
      id: "default_2",
      sender: "seller",
      text: `Hello Vanneth Sok! Thank you for reaching out to ${activeStore}. How can we assist you today?`,
      time: "Yesterday",
    },
  ];

  function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "buyer",
      text: chatInput.trim(),
      time: "Just now",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeStore]: [...(prev[activeStore] || currentMessages), newMsg],
    }));

    const textSent = chatInput;
    setChatInput("");

    setTimeout(() => {
      setMessagesMap((prev) => ({
        ...prev,
        [activeStore]: [
          ...(prev[activeStore] || []),
          {
            id: `reply_${Date.now()}`,
            sender: "seller",
            text: `Received: "${textSent}". Thank you, Vanneth Sok! ${activeStore} team will assist you shortly.`,
            time: "Just now",
          },
        ],
      }));
    }, 1200);
  }

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

          {/* Chat Threads List — 15 Shops with Sleek Scrollbar */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F0EDFB] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-200/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-400">
            {filteredThreads.map((thread) => {
              const isActive = thread.storeName === activeStore;
              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveStore(thread.storeName)}
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
                      {thread.lastMessage}
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

        {/* ── RIGHT MAIN CHAT AREA (EXPANDED TO FULL RIGHT BOUNDARY) ── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F7FC] w-full">
          {/* Active Chat Header */}
          <div className="flex items-center justify-between border-b border-[#EDEBF3] bg-white px-8 py-4 shrink-0 w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6C4CD8] text-white font-extrabold text-[18px] shadow-xs">
                <Store size={20} />
              </div>
              <div>
                <h3 className="text-[18px] font-extrabold text-[#1A1330]">{activeStore}</h3>
                <p className="text-[12.5px] text-[#8B85A0] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Online Official Merchant · Response Rate: 99%
                </p>
              </div>
            </div>

            <span className="rounded-xl bg-emerald-100 px-3.5 py-1.5 text-[12.5px] font-extrabold text-emerald-700">
              Direct Seller Line
            </span>
          </div>

          {/* MESSAGES BODY WITH SLEEK FLUSH SCROLLBAR */}
          <div className="flex-1 overflow-y-auto p-8 space-y-4 w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-300/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-500/80">
            {currentMessages.map((msg) => (
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
                        #ORD-95508
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 py-1">
                      <div className="flex justify-between text-[13.5px]">
                        <span className="font-bold text-[#1A1330] truncate max-w-[280px]">MacBook Laptop — M2 Chip (16GB RAM)</span>
                        <span className="font-extrabold text-[#6C4CD8]">$399.00</span>
                      </div>
                      <div className="flex justify-between text-[13.5px]">
                        <span className="font-bold text-[#1A1330] truncate max-w-[280px]">Iphone 12 Pro Pacific Blue 128gb (x1)</span>
                        <span className="font-extrabold text-[#6C4CD8]">$129.00</span>
                      </div>
                    </div>

                    <div className="border-t border-[#F0EDFB] pt-3 text-[12.5px] text-[#8B85A0] space-y-1">
                      <p><strong>Deliver To:</strong> Vanneth Sok (096 888 7777)</p>
                      <p><strong>Address:</strong> House #42B, Street 271, Tuol Sangkae 2, Ruessei Kaev, Phnom Penh</p>
                      <p><strong>Payment Option:</strong> Pay Now (KHQR)</p>
                    </div>

                    <div className="border-t border-[#EDEBF3] pt-3 flex justify-between font-extrabold text-[16px] text-[#1A1330]">
                      <span>Total Invoice Amount</span>
                      <span className="text-[#6C4CD8] text-[18px]">$518.00</span>
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
                          ABA PAY / KHQR Code for {activeStore}
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
            <form onSubmit={handleSendMessage} className="flex items-center gap-3 w-full">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Type your message to ${activeStore}…`}
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
