import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "My shop | Phsar Digital",
  description:
    "Manage your shop details, contact information, and the map pin buyers see.",
};

export default function ShopPage() {
  return <ShopClient />;
}
