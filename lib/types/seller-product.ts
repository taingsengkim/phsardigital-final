export interface SellerCategory {
  uuid: string
  name: string
}

export interface UploadedFile {
  objectName: string
  uri?: string
  url?: string
}

export interface ListingImageInput {
  objectName: string
  sortOrder: number
  isPrimary: boolean
}

export interface ListingAttributeInput {
  key: string
  value: string
  sortOrder: number
}

export interface CreateListingRequest {
  categoryUuid: string
  title: string
  description: string
  price: number
  stockQty: number
  isFeatured: boolean
  thumbnailObjectName?: string
  images: ListingImageInput[]
  listingAttributes: ListingAttributeInput[]
}

export interface SellerListing extends CreateListingRequest {
  uuid: string
  createdAt?: string
  updatedAt?: string
}
