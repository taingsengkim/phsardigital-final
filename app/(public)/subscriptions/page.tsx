import type { Metadata } from "next";
import SubscriptionsClient from "./SubscriptionsClient";

export const metadata: Metadata = {
  title: "Seller Subscriptions & Plans | Phsar Digital",
  description:
    "Explore subscription plans to post listings and grow your store on Phsar Digital.",
};

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  // Set by PaymentRequiredRedirect when a 402 bounced the seller here, so the
  // page can say why they arrived instead of just showing prices.
  const { reason } = await searchParams;
  return (
    <SubscriptionsClient subscriptionRequired={reason === "subscription-required"} />
  );
}
