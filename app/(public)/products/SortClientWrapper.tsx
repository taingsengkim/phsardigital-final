"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import SortDropdown from "@/components/product/SortDropdown";
import Pagination from "@/components/product/Pagination";
import type { ListingsQuery } from "@/lib/types";

type SortOption = NonNullable<ListingsQuery["sort"]>;

/** Drives sort changes via URL search params (works with server page). */
export function SortClientWrapper({ sort }: { sort: SortOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSort(value: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page"); // reset to page 1 on sort change
    router.push(`${pathname}?${params.toString()}`);
  }

  return <SortDropdown value={sort} onChange={handleSort} />;
}

/** Drives page changes via URL search params. */
export function PaginationWrapper({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handlePage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Pagination page={page} totalPages={totalPages} onPageChange={handlePage} />
  );
}
