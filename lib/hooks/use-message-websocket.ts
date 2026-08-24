"use client"

import * as React from "react"
import { Client, type IMessage } from "@stomp/stompjs"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/Store"
import { sellerMessageApi } from "@/lib/redux/service/sellerMessageApi"

type ConnectionState = "connecting" | "connected" | "disconnected" | "error"
type RealtimeMessage = { conversationUuid?: string }

function websocketUrl() {
  if (process.env.NEXT_PUBLIC_WEBSOCKET_URL) return process.env.NEXT_PUBLIC_WEBSOCKET_URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://phsardigital.quizzy.it.com"
  return `${apiUrl.replace(/^http/, "ws").replace(/\/$/, "")}/ws`
}

export function useMessageWebSocket() {
  const dispatch = useDispatch<AppDispatch>()
  const [state, setState] = React.useState<ConnectionState>("connecting")

  React.useEffect(() => {
    let disposed = false
    let client: Client | undefined

    async function connect() {
      try {
        const response = await fetch("/api/auth/access-token", { cache: "no-store" })
        if (!response.ok) throw new Error("WebSocket authentication failed")
        const { accessToken } = await response.json() as { accessToken: string }
        if (disposed) return

        client = new Client({
          brokerURL: websocketUrl(),
          connectHeaders: { Authorization: `Bearer ${accessToken}` },
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          onConnect: () => {
            setState("connected")
            const destination = process.env.NEXT_PUBLIC_MESSAGE_SUBSCRIPTION || "/user/queue/messages"
            client?.subscribe(destination, (frame: IMessage) => {
              let message: RealtimeMessage = {}
              try { message = JSON.parse(frame.body) as RealtimeMessage } catch { /* invalidate conversations below */ }
              dispatch(sellerMessageApi.util.invalidateTags([
                "Conversations",
                ...(message.conversationUuid ? [{ type: "Messages" as const, id: message.conversationUuid }] : []),
              ]))
            })
          },
          onWebSocketClose: () => { if (!disposed) setState("disconnected") },
          onStompError: () => { if (!disposed) setState("error") },
          onWebSocketError: () => { if (!disposed) setState("error") },
        })
        client.activate()
      } catch {
        if (!disposed) setState("error")
      }
    }

    connect()
    return () => {
      disposed = true
      void client?.deactivate()
    }
  }, [dispatch])

  return state
}
