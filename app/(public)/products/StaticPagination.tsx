"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Pagination from "@/components/product/Pagination";

type Props = { page: number; totalPages: number };

export default function StaticPagination({ page, totalPages }: Props) {
  const router      = useRouter();
  const pathname    = usePathname();
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
