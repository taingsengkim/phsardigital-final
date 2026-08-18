import type { Metadata } from "next";
import SubscriptionsClient from "./SubscriptionsClient";

export const metadata: Metadata = {
  title: "Seller Subscriptions & Plans | Phsar Digital",
  description:
    "Explore subscription plans to post listings and grow your store on Phsar Digital.",
};

export default function SubscriptionsPage() {
  return <SubscriptionsClient />;
}
