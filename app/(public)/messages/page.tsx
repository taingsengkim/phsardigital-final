import { Suspense } from "react";
import MessagesClient from "./MessagesClient";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[#8B85A0]">Loading messages portal…</div>}>
      <MessagesClient />
    </Suspense>
  );
}
