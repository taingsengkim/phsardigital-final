import { Suspense } from "react";
import StoreDetailPageClient from "./StoreDetailPageClient";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug ?? "";

  return (
    <div className="min-h-screen bg-[#F9F8FD] text-[#1A1330] py-8">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <Suspense fallback={<div className="py-20 text-center text-[#8B85A0]">Loading store profile...</div>}>
          <StoreDetailPageClient slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}

