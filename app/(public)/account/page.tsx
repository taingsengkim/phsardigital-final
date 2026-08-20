import AccountPageClient from "./AccountPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Phsar Digital",
  description: "Manage your profile details, contact information, and account settings on Phsar Digital.",
};

export default function AccountPage() {
  return <AccountPageClient />;
}
