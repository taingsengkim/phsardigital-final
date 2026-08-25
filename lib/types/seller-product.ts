export interface SellerCategory {
  uuid: string
  name: string
}

export interface SellerCategoryTree extends SellerCategory {
  slug?: string
  iconUrl?: string
  description?: string
  level?: number
  children: SellerCategoryTree[]
}

export type CategoryAttributeDataType = "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "MULTI_SELECT"

export interface CategoryAttributeOption {
  uuid?: string
  value: string
  label?: string
  sortOrder?: number
}

export interface CategoryAttributeDefinition {
  uuid: string
  code: string
  label: string
  group?: string
  dataType: CategoryAttributeDataType
  unit?: string
  required?: boolean
  sortOrder?: number
  groupSortOrder?: number
  options?: CategoryAttributeOption[]
}

export interface CategoryAttributeGroup {
  name?: string
  attributes: CategoryAttributeDefinition[]
}

export interface CategoryAttributeSchema {
  categoryUuid: string
  categorySlug?: string
  categoryName?: string
  groups?: CategoryAttributeGroup[]
  attributes?: CategoryAttributeDefinition[]
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
  fullPrice: number
  discountPrice?: number
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

export interface DeleteListingRequest {
  uuid: string
}

export type ListingStatus = "DRAFT" | "ACTIVE" | "SOLD_OUT" | "ARCHIVED" | "SUSPENDED"

export interface UpdateListingBody {
  categoryUuid?: string
  title?: string
  description?: string
  fullPrice?: number
  discountPrice?: number
  stockQty?: number
  status?: ListingStatus
  isFeatured?: boolean
  listingAttributes?: ListingAttributeInput[]
}

export interface UpdateListingRequest {
  uuid: string
  body: UpdateListingBody
}

export interface UpdateListingThumbnailRequest {
  uuid: string
  objectName: string
}

export interface AddListingImageMutationRequest {
  uuid: string
  objectName: string
  /** Omitted appends to the end of the gallery. */
  sortOrder?: number
}

export interface ReorderListingImagesRequest {
  uuid: string
  /** The complete gallery, first to last. Position is the array index. */
  imageUuids: string[]
}

export interface RemoveListingImageRequest {
  uuid: string
  imageUuid: string
}
