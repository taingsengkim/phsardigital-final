"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/ButtonPurple";

export function NewsletterSignup() {
  const [email, setEmail] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to a real subscribe endpoint — e.g. an RTK Query mutation
    // in homeApi.ts once the backend has one (builder.mutation<void, { email: string }>)
    console.log("subscribe:", email);
    setEmail("");
  }

  return (
    <section className="border-y border-[#EDEBF3] bg-[#ECEAF7] py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-[#1A1330]">Sign up for Phsar Digital&apos;s News &amp; Offers</h3>
          <p className="text-sm text-[#5A5470]">
            Be the first to know about exclusive deals, new arrivals, and marketplace insights!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-[#C8C3E0] bg-white px-4 py-2.5 shadow-sm">
            <Mail size={16} className="text-[#6C4CD8]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Phsar.Digital@com.kh"
              className="w-full bg-transparent text-sm text-[#241F35] outline-none placeholder:text-[#8B85A0]"
            />
          </div>
          <Button type="submit" variant="primary">
            Sign up
          </Button>
        </form>
      </div>
    </section>
  );
}
