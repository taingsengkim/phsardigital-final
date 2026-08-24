import { CreateProduct } from "@/components/ui/seller/create-product"

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>
}) {
  const query = await searchParams
  const editUuid = Array.isArray(query.edit) ? query.edit[0] : query.edit

  return (
    <main className="min-h-[calc(100svh-70px)] bg-[#f7f7f8] px-4 py-7 sm:px-8">
      <CreateProduct editUuid={editUuid?.trim()} />
    </main>
  )
}
