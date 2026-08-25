export const SELLER_DRAFTS_STORAGE_KEY = "phsar-digital:seller-product-drafts"

export type SellerProductDraft = {
  id: string
  title: string
  description: string
  categoryUuid: string
  price: string
  discountPrice?: string
  stockQty: string
  imageNames: string[]
  thumbnailObjectName?: string
  isFeatured?: boolean
  categoryPath?: string[]
  listingAttributes?: Array<{ key: string; value: string; sortOrder: number }>
  updatedAt: string
}

export function readSellerDrafts(): SellerProductDraft[] {
  if (typeof window === "undefined") return []

  try {
    const value = JSON.parse(localStorage.getItem(SELLER_DRAFTS_STORAGE_KEY) ?? "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function writeSellerDrafts(drafts: SellerProductDraft[]) {
  localStorage.setItem(SELLER_DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
}
