"use client";
import { AppStore, makeStore } from "@/lib/Store";
import { useRef } from "react";
import { Provider } from "react-redux";
import { PaymentRequiredRedirect } from "@/components/subscriptions/PaymentRequiredRedirect";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <PaymentRequiredRedirect />
      {children}
    </Provider>
  );
}
