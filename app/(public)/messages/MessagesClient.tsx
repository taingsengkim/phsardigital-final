"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, MessageSquare } from "lucide-react"
import { authClient, useSession } from "@/lib/auth-client"
import { MessageCenter } from "@/components/ui/message"
import {
  useGetConversationsQuery,
  useStartConversationMutation,
} from "@/lib/redux/service/sellerMessageApi"

export default function MessagesClient() {
  const searchParams = useSearchParams()
  const sellerParam = searchParams.get("seller")?.trim() ?? ""
  const listingParam = searchParams.get("listing")?.trim() ?? ""
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <div className="grid min-h-[calc(100dvh-8rem)] place-items-center bg-background"><Loader2 className="size-7 animate-spin text-primary" /></div>
  }

  if (!session?.user) return <SignInPrompt />
  return <BuyerMessageCenter sellerParam={sellerParam} listingParam={listingParam} />
}

function SignInPrompt() {
  return (
    <main className="grid min-h-[calc(100dvh-8rem)] place-items-center bg-background p-4 text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><MessageSquare className="size-6" /></span>
        <h1 className="mt-4 text-xl font-extrabold">Sign in to message sellers</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Chat directly with stores about stock, sizing, delivery, or bulk orders.</p>
        <button type="button" onClick={() => authClient.signIn.oauth2({ providerId: "keycloak", callbackURL: typeof window !== "undefined" ? window.location.href : "/messages" })} className="mt-6 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">Sign in to continue</button>
      </section>
    </main>
  )
}

function BuyerMessageCenter({
  sellerParam,
  listingParam,
}: {
  sellerParam: string
  listingParam: string
}) {
  const { data: conversations = [], isLoading } = useGetConversationsQuery()
  const [startConversation] = useStartConversationMutation()
  const startedFor = React.useRef("")

  React.useEffect(() => {
    if (!sellerParam || isLoading) return
    if (conversations.some((conversation) => conversation.otherUserId === sellerParam)) return
    if (startedFor.current === sellerParam) return
    startedFor.current = sellerParam
    startConversation({ participantId: sellerParam })
  }, [conversations, isLoading, sellerParam, startConversation])

  return (
    <MessageCenter
      audience="buyer"
      initialListingUuid={listingParam}
      initialSellerId={sellerParam}
    />
  )
}
