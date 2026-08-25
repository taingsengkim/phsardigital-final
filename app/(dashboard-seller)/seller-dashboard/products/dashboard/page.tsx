import React from 'react';
import { ProductDashboardUI } from '@/components/ui/product/product-dashboard-ui';

export default async function ProductDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const successMessage = success === "created"
    ? "Product created successfully."
    : success === "updated"
      ? "Product updated successfully."
      : undefined;

  return <ProductDashboardUI successMessage={successMessage} />;
}
