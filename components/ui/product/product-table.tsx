"use client";

import React from "react";
import Image from "next/image";
import {
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductRow {
  id: string;
  title: string;
  category: string;
  image: string;
  status: "active" | "deactive";
  price: string;
  views: string;
  /** Width of the views indicator bar, in percent of the track. */
  viewsBar: number;
  likes: number;
  /** Width of the likes indicator bar, in percent of the track. */
  likesBar: number;
  likesColor: string;
}

const defaultProducts: ProductRow[] = [
  {
    id: "p-1",
    title: "Bento Matte 3D Illustration",
    category: "UI design kit",
    image: "/picture/pic1.jpg",
    status: "active",
    price: "$98",
    views: "48k",
    viewsBar: 25,
    likes: 8,
    likesBar: 100,
    likesColor: "bg-red-500",
  },
  {
    id: "p-2",
    title: "Bento Matte 3D Illustration",
    category: "UI design kit",
    image: "/picture/pic2.jpg",
    status: "active",
    price: "$48",
    views: "80k",
    viewsBar: 45,
    likes: 8,
    likesBar: 55,
    likesColor: "bg-purple-500",
  },
  {
    id: "p-3",
    title: "Bento Matte 3D Illustration",
    category: "UI design kit",
    image: "/picture/pic3.jpg",
    status: "active",
    price: "$78",
    views: "80k",
    viewsBar: 80,
    likes: 8,
    likesBar: 20,
    likesColor: "bg-purple-500",
  },
  {
    id: "p-4",
    title: "Bento Matte 3D Illustration",
    category: "UI design kit",
    image: "/picture/pic4.jpg",
    status: "active",
    price: "$68",
    views: "24k",
    viewsBar: 25,
    likes: 8,
    likesBar: 100,
    likesColor: "bg-green-500",
  },
  {
    id: "p-5",
    title: "Bento Matte 3D Illustration",
    category: "UI design kit",
    image: "/picture/pic5.jpg",
    status: "deactive",
    price: "$98",
    views: "20k",
    viewsBar: 60,
    likes: 8,
    likesBar: 70,
    likesColor: "bg-red-500",
  },
];

export const ProductTable: React.FC<{ products?: ProductRow[] }> = ({
  products = defaultProducts,
}) => {
  const [query, setQuery] = React.useState("");

  const visibleProducts = products.filter((product) =>
    `${product.title} ${product.category}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Card header: title + search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-4 rounded-full bg-purple-200" />
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product"
            aria-label="Search product"
            className="w-full rounded-2xl bg-gray-50 py-3 pr-4 pl-12 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-sm font-medium text-gray-400">
              <th className="pb-4 font-medium">Product</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Price</th>
              <th className="pb-4 font-medium">Views</th>
              <th className="pb-4 pr-4 font-medium">Wishlist</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => (
              <tr
                key={product.id}
                className="group border-t border-gray-100 align-top transition-colors hover:bg-gray-50/80"
              >
                {/* Product: thumbnail, title, hover actions */}
                <td className="border-t border-gray-100 py-6 pr-6">
                  <div className="flex items-start gap-4">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={80}
                      height={80}

                      className="size-20 shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="max-w-[180px] text-base leading-snug font-bold text-gray-900">
                        {product.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {product.category}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="border-t border-gray-100 py-6 pr-6">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium",
                      product.status === "active"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                    )}
                  >
                    {product.status === "active" ? "Active" : "Deactive"}
                  </span>
                </td>

                <td className="border-t border-gray-100 py-6 pr-6 text-base font-medium text-gray-900">
                  {product.price}
                </td>

                <td className="border-t border-gray-100 py-6 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold text-gray-900">
                      {product.views}
                    </span>
                    <span className="h-3 w-10 overflow-hidden rounded-sm bg-transparent">
                      <span
                        className="block h-full rounded-sm bg-blue-500"
                        style={{ width: `${product.viewsBar}%` }}
                      />
                    </span>
                  </div>
                </td>

                <td className="border-t border-gray-100 py-6 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {product.likes}
                    </span>
                    <span className="h-3 w-10 overflow-hidden rounded-sm bg-transparent">
                      <span
                        className={cn("block h-full rounded-sm", product.likesColor)}
                        style={{ width: `${product.likesBar}%` }}
                      />
                    </span>
                  </div>
                </td>
              </tr>
            ))}

            {visibleProducts.length === 0 && (
              <tr className="border-t border-gray-100">
                <td
                  colSpan={6}
                  className="border-t border-gray-100 py-12 text-center text-sm text-gray-400"
                >
                  No products match &ldquo;{query}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
