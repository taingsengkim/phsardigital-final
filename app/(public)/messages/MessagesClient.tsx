"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient, useSession } from "@/lib/auth-client";
import {
  useGetConversationMessagesQuery,
  useGetConversationsQuery,
  useMarkConversationReadMutation,
  useSendConversationMessageMutation,
  useStartConversationMutation,
} from "@/lib/redux/service/sellerMessageApi";
import { useMessageWebSocket } from "@/lib/hooks/use-message-websocket";
import { useStoreProfiles } from "@/lib/hooks/use-store-profiles";
import type {
  ConversationMessage,
  SellerConversation,
} from "@/lib/types/seller-message";

/** Thread-list stamp: clock time for today, "Yesterday", then a short date. */
function threadStamp(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "2-digit" });
}

function bubbleStamp(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** The API pages messages newest-first; a chat log has to read oldest-first. */
function inChatOrder(messages: ConversationMessage[]): ConversationMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );
}

const SHELL =
  "fixed inset-x-0 bottom-0 top-[108px] z-40 bg-[#F6F5FA] p-4 md:p-6 flex flex-col overflow-hidden";

export default function MessagesClient() {
  const searchParams = useSearchParams();
  const sellerParam = searchParams.get("seller")?.trim() ?? "";
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className={cn(SHELL, "items-center justify-center")}>
        <Loader2 className="animate-spin text-[#6C4CD8]" size={30} />
      </div>
    );
  }

  if (!session?.user) return <SignInPrompt />;

  return <BuyerChat sellerParam={sellerParam} />;
}

function SignInPrompt() {
  return (
    <div className={cn(SHELL, "items-center justify-center")}>
      <div className="w-full max-w-md rounded-3xl border border-[#EDEBF3] bg-white p-8 text-center shadow-[0_12px_40px_rgba(26,19,48,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F0FC] text-[#6C4CD8]">
          <MessageSquare size={26} />
        </div>
        <h2 className="mt-4 text-[20px] font-extrabold text-[#1A1330]">
          Sign in to message sellers
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[#8B85A0]">
          Chat directly with any store on Phsar Digital — ask about stock,
          sizing, delivery or bulk orders before you buy.
        </p>
        <button
          type="button"
          onClick={() =>
            authClient.signIn.oauth2({
              providerId: "keycloak",
              callbackURL:
                typeof window !== "undefined"
                  ? window.location.href
                  : "/messages",
            })
          }
          className="mt-6 w-full rounded-2xl bg-[#6C4CD8] px-6 py-3.5 text-[15px] font-extrabold text-white shadow-md transition hover:bg-[#5B3DC0]"
        >
          Sign in to continue
        </button>
      </div>
    </div>
  );
}

function BuyerChat({ sellerParam }: { sellerParam: string }) {
  const connectionState = useMessageWebSocket();

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    isError,
    refetch,
  } = useGetConversationsQuery();
  const [startConversation, { isLoading: isStarting }] =
    useStartConversationMutation();
  const [sendMessage, { isLoading: isSending }] =
    useSendConversationMessageMutation();
  const [markRead] = useMarkConversationReadMutation();

  const [selectedId, setSelectedId] = React.useState("");
  const [createdId, setCreatedId] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [startError, setStartError] = React.useState("");

  /* Arriving from a "Chat" button with ?seller=<id>: if there is no thread with
     that seller yet, open one. The ref stops a re-render from posting twice;
     once the list refetches, the new thread resolves through deepLinkedId. */
  const startedFor = React.useRef("");
  React.useEffect(() => {
    if (!sellerParam || conversationsLoading) return;
    if (conversations.some((item) => item.otherUserId === sellerParam)) return;
    if (startedFor.current === sellerParam) return;
    startedFor.current = sellerParam;

    startConversation({ participantId: sellerParam })
      .unwrap()
      .then((created) => setCreatedId(created.uuid))
      .catch(() =>
        setStartError(
          "Could not open a chat with this seller. Please try again.",
        ),
      );
  }, [sellerParam, conversationsLoading, conversations, startConversation]);

  /* A thread the buyer clicked wins over the one the link pointed at. */
  const deepLinkedId = sellerParam
    ? conversations.find((item) => item.otherUserId === sellerParam)?.uuid
    : undefined;
  const activeId =
    selectedId || deepLinkedId || createdId || conversations[0]?.uuid || "";
  const active = conversations.find((item) => item.uuid === activeId);

  const { data: messagePage, isLoading: messagesLoading } =
    useGetConversationMessagesQuery(
      { conversationUuid: activeId },
      { skip: !activeId },
    );
  const messages = React.useMemo(
    () => inChatOrder(messagePage?.content ?? []),
    [messagePage],
  );

  /* Opening a thread clears its unread badge. */
  React.useEffect(() => {
    if (!activeId) return;
    const conversation = conversations.find((item) => item.uuid === activeId);
    if (conversation && conversation.unreadCount > 0) markRead(activeId);
  }, [activeId, conversations, markRead]);

  const logRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const node = logRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, activeId]);

  async function submitMessage(event?: React.FormEvent) {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || isSending) return;
    setDraft("");
    try {
      await sendMessage({ conversationUuid: activeId, body }).unwrap();
    } catch {
      setDraft(body); // keep what they typed so the send can be retried
    }
  }

  /* The API names the other *user*; a buyer expects the shop behind them. */
  const otherUserIds = React.useMemo(
    () => conversations.map((item) => item.otherUserId),
    [conversations],
  );
  const storeProfiles = useStoreProfiles(otherUserIds);
  const identityOf = React.useCallback(
    (conversation?: SellerConversation) => {
      const profile = conversation
        ? storeProfiles[conversation.otherUserId]
        : undefined;
      return {
        name:
          profile?.businessName || conversation?.otherUserName || "Store",
        avatar: profile?.logoUri || conversation?.otherUserAvatar,
      };
    },
    [storeProfiles],
  );

  const needle = query.trim().toLowerCase();
  const visibleConversations = needle
    ? conversations.filter((item) =>
        identityOf(item).name.toLowerCase().includes(needle),
      )
    : conversations;

  const storeName = identityOf(active).name;

  return (
    <div className={SHELL}>
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white shadow-[0_12px_40px_rgba(26,19,48,0.08)] md:flex-row">
        {/* ── LEFT: shop threads ── */}
        <div className="flex h-full w-full shrink-0 flex-col overflow-hidden border-r border-[#EDEBF3] bg-white md:w-[320px]">
          <div className="shrink-0 space-y-2.5 border-b border-[#F0EDFB] bg-[#F8F7FC] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1A1330]">
                <MessageSquare size={18} className="text-[#6C4CD8]" />
                <h3 className="text-[16px] font-extrabold">Shop Chats</h3>
              </div>
              <span className="rounded-full bg-[#6C4CD8] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                {conversations.length}
              </span>
            </div>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-[#8B85A0]"
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search shops or chats…"
                className="w-full rounded-xl border border-[#E2DFEC] bg-white py-1.5 pl-8 pr-3 text-[12px] text-[#1A1330] outline-none focus:border-[#6C4CD8]"
              />
            </div>
          </div>

          <div className="flex-1 divide-y divide-[#F0EDFB] overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-200/80 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 hover:[&::-webkit-scrollbar-thumb]:bg-purple-400">
            {conversationsLoading || isStarting ? (
              <div className="flex justify-center py-14">
                <Loader2 className="animate-spin text-[#6C4CD8]" />
              </div>
            ) : isError ? (
              <div className="px-4 py-14 text-center text-[12.5px] text-[#8B85A0]">
                <p>Could not load your chats.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 font-extrabold text-[#6C4CD8]"
                >
                  Try again
                </button>
              </div>
            ) : visibleConversations.length === 0 ? (
              <p className="px-6 py-14 text-center text-[12.5px] leading-relaxed text-[#8B85A0]">
                {conversations.length === 0
                  ? "No chats yet. Open any product or store and tap Chat to message the seller."
                  : "No shops match your search."}
              </p>
            ) : (
              visibleConversations.map((conversation) => {
                const isActive = conversation.uuid === activeId;
                const identity = identityOf(conversation);
                return (
                  <button
                    key={conversation.uuid}
                    type="button"
                    onClick={() => setSelectedId(conversation.uuid)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 p-4 text-left transition-all",
                      isActive
                        ? "border-l-4 border-[#6C4CD8] bg-[#F3F0FC]"
                        : "hover:bg-[#F8F7FC]",
                    )}
                  >
                    <StoreAvatar
                      name={identity.name}
                      avatar={identity.avatar}
                      size={40}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "truncate text-[13.5px]",
                            isActive
                              ? "font-black text-[#6C4CD8]"
                              : "font-bold text-[#1A1330]",
                          )}
                        >
                          {identity.name}
                        </p>
                        <span className="ml-1 shrink-0 text-[10px] text-[#8B85A0]">
                          {threadStamp(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11.5px] text-[#8B85A0]">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: active conversation ── */}
        <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-[#F8F7FC]">
          <div className="flex w-full shrink-0 items-center justify-between border-b border-[#EDEBF3] bg-white px-8 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <StoreAvatar
                name={storeName}
                avatar={identityOf(active).avatar}
                size={44}
              />
              <div className="min-w-0">
                <h3 className="truncate text-[18px] font-extrabold text-[#1A1330]">
                  {activeId ? storeName : "Your messages"}
                </h3>
                <p className="flex items-center gap-1.5 text-[12.5px] text-[#8B85A0]">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      connectionState === "connected"
                        ? "bg-emerald-500"
                        : "bg-amber-500",
                    )}
                  />
                  {connectionState === "connected"
                    ? "Live · messages arrive instantly"
                    : connectionState === "connecting"
                      ? "Connecting…"
                      : "Reconnecting…"}
                </p>
              </div>
            </div>

            <span className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-emerald-100 px-3.5 py-1.5 text-[12.5px] font-extrabold text-emerald-700 sm:inline-flex">
              <ShieldCheck size={14} />
              Direct Seller Line
            </span>
          </div>

          {startError && (
            <p className="shrink-0 bg-rose-50 px-8 py-2.5 text-[12.5px] font-semibold text-rose-600">
              {startError}
            </p>
          )}

          <div
            ref={logRef}
            className="w-full flex-1 space-y-4 overflow-y-auto p-8 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-300/60 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2 hover:[&::-webkit-scrollbar-thumb]:bg-purple-500/80"
          >
            {!activeId ? (
              <p className="pt-24 text-center text-[13px] text-[#8B85A0]">
                Select a shop on the left to read the conversation.
              </p>
            ) : messagesLoading ? (
              <div className="flex justify-center pt-24">
                <Loader2 className="animate-spin text-[#6C4CD8]" />
              </div>
            ) : messages.length === 0 ? (
              <p className="pt-24 text-center text-[13px] text-[#8B85A0]">
                Say hello to {storeName} — ask about stock, sizing or delivery.
              </p>
            ) : (
              messages.map((message) => {
                const fromSeller = message.senderId === active?.otherUserId;
                return (
                  <div
                    key={message.uuid}
                    className={cn(
                      "flex max-w-[80%] flex-col",
                      fromSeller ? "mr-auto items-start" : "ml-auto items-end",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4.5 py-3.5 text-[15px] leading-relaxed shadow-xs",
                        fromSeller
                          ? "rounded-tl-none border border-[#EDEBF3] bg-white text-[#1A1330]"
                          : "rounded-tr-none bg-[#6C4CD8] text-white",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.body}
                      </p>
                    </div>
                    <span className="mt-1 text-[11px] text-[#8B85A0]">
                      {bubbleStamp(message.sentAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="w-full shrink-0 border-t border-[#EDEBF3] bg-white p-5">
            <form
              onSubmit={submitMessage}
              className="flex w-full items-center gap-3"
            >
              <input
                type="text"
                value={draft}
                disabled={!activeId}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  activeId
                    ? `Type your message to ${storeName}…`
                    : "Select a chat to start messaging"
                }
                className="min-w-0 flex-1 rounded-2xl border border-[#E2DFEC] bg-[#F6F5FA] px-6 py-4 text-[15px] text-[#1A1330] outline-none transition focus:border-[#6C4CD8] focus:bg-white disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!draft.trim() || !activeId || isSending}
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#6C4CD8] text-white shadow-md transition hover:bg-[#5B3DC0] disabled:opacity-50"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <Send size={22} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Store logo when the seller has one, otherwise the storefront mark. */
function StoreAvatar({
  name,
  avatar,
  size,
}: {
  name?: string;
  avatar?: string;
  size: number;
}) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#6C4CD8] font-bold text-white shadow-xs"
      style={{ height: size, width: size }}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={name || "Store"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <Store size={Math.round(size * 0.45)} />
      )}
    </div>
  );
}
