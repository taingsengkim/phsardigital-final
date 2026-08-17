import type { Metadata } from "next";
import SellerApplicationClient from "./SellerApplicationClient";

export const metadata: Metadata = {
  title: "Become a Seller | Phsar Digital",
  description:
    "Apply to become a seller on Phsar Digital. Submit your business information, documents, and manage your seller application status.",
};

export default function SellerApplicationPage() {
  return <SellerApplicationClient />;
}
