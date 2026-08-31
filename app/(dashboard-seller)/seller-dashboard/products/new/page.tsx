import { CreateProduct } from "@/components/ui/seller/create-product"

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>
}) {
  const query = await searchParams
  const editUuid = Array.isArray(query.edit) ? query.edit[0] : query.edit

  return <CreateProduct editUuid={editUuid?.trim()} />
}
