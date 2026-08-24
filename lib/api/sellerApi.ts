import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type DocumentType = "ID_CARD" | "BUSINESS_LICENSE" | "OTHER";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "NOT_FOUND";

export interface SellerDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  uri: string;
  uploadedAt?: string;
}

export interface SellerApplication {
  id: string;
  userId?: string;
  businessName: string;
  storeDisplayName?: string;
  businessType?: "INDIVIDUAL" | "SOLE_PROPRIETORSHIP" | "PARTNERSHIP" | "COMPANY";
  description?: string;
  logoObjectName?: string;
  logoUri?: string;
  address?: string;
  city?: string;
  province?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  status: ApplicationStatus;
  rejectionNote?: string | null;
  missingDocuments?: DocumentType[];
  documents?: SellerDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSellerApplicationPayload {
  businessName: string;
  storeDisplayName?: string;
  businessType?: "INDIVIDUAL" | "SOLE_PROPRIETORSHIP" | "PARTNERSHIP" | "COMPANY";
  description?: string;
  logoObjectName?: string;
  logoUri?: string;
  address?: string;
  city?: string;
  province?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface UploadFileResponse {
  objectName: string;
  uri?: string;
  url?: string;
}

export interface UploadDocumentResponse {
  id: string;
  type?: DocumentType;
  docType?: DocumentType;
  fileName?: string;
  uri?: string;
}

export interface AttachDocumentPayload {
  docType: DocumentType;
  objectName: string;
}

export type SubscriptionPlanType = "BASIC" | "STANDARD" | "PREMIUM";

export interface SubscriptionPlan {
  plan: SubscriptionPlanType;
  displayName: string;
  priceUsd: number;
  durationDays: number;
  listingLimit: number;
}

export interface SellerSubscription {
  sellerId: string;
  plan: SubscriptionPlanType;
  planDisplayName: string;
  status: "ACTIVE" | "EXPIRED";
  startedAt: string;
  expiresAt: string;
  listingsUsed: number;
  listingLimit: number;
  canPostListing: boolean;
  canChat: boolean;
}

export interface SubscribePayload {
  plan: SubscriptionPlanType;
}

export interface SellerProfile {
  id: string;
  businessName: string;
  businessType?: string;
  description?: string;
  logoObjectName?: string;
  logoUri?: string;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  isActive?: boolean;
  phoneNumber?: string;
  biography?: string;
  socialLink?: string[];
  averageRating?: number | null;
  reviewCount?: number;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
}

/**
 * PATCH /api/v1/sellers/me — the seller edits their own shop, identified by
 * the bearer token, so there is no id in the path. Every field is optional;
 * only what you send is changed.
 */
export interface UpdateSellerProfilePayload {
  businessName?: string;
  businessType?: string;
  description?: string;
  logoObjectName?: string;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number | null;
  longitude?: number | null;
  googleMapUrl?: string;
  phoneNumber?: string;
  biography?: string;
  socialLink?: string[];
}

export interface SellerOrderItem {
  listingUuid: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SellerOrder {
  uuid: string;
  buyerId: string;
  sellerId: string;
  businessName: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  shippingAddress?: string;
  note?: string;
  items?: SellerOrderItem[];
  createdAt: string;
}

export interface PagedSellerOrders {
  content: SellerOrder[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface SellerReview {
  uuid: string;
  comment: string;
  rating: number;
  createdAt: string;
  buyer?: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  listing?: {
    title?: string;
  };
}

export interface PagedSellerReviews {
  content: SellerReview[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export const sellerApi = createApi({
  reducerPath: "sellerApi",
  tagTypes: [
    "SellerApplication",
    "SellerSubscription",
    "SellerProfile",
    "SellerOrders",
    "SellerReviews",
    "SellerListings",
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  endpoints: (builder) => ({
    getSellerApplication: builder.query<SellerApplication | null, void>({
      query: () => ({
        url: "/seller-applications/me",
      }),
      providesTags: ["SellerApplication"],
      transformResponse: (response: any) => {
        if (!response || response.status === "NOT_FOUND" || response.notFound) {
          return null;
        }
        return response as SellerApplication;
      },
    }),

    createSellerApplication: builder.mutation<
      SellerApplication,
      CreateSellerApplicationPayload
    >({
      query: (payload) => ({
        url: "/seller-applications",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SellerApplication"],
    }),

    // Logo image upload -> POST /api/v1/files/upload (Allowed: jpeg, png, webp, gif, max 5MB)
    uploadLogoFile: builder.mutation<UploadFileResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/files/upload",
          method: "POST",
          body: formData,
        };
      },
    }),

    // Document file upload -> POST /api/v1/files/documents (Allowed: pdf, jpeg, png, doc, docx, max 10MB)
    uploadDocumentFile: builder.mutation<UploadFileResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/files/documents",
          method: "POST",
          body: formData,
        };
      },
    }),

    // Attach document metadata to seller application -> POST /api/v1/seller-applications/me/documents (JSON body)
    attachDocument: builder.mutation<UploadDocumentResponse, AttachDocumentPayload>({
      query: (payload) => ({
        url: "/seller-applications/me/documents",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      }),
      invalidatesTags: ["SellerApplication"],
    }),

    // Subscriptions
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => ({
        url: "/subscriptions/plans",
      }),
    }),

    getSellerSubscription: builder.query<SellerSubscription | null, void>({
      query: () => ({
        url: "/subscriptions/me",
      }),
      providesTags: ["SellerSubscription"],
      transformResponse: (response: any) => {
        if (!response || response.notFound) {
          return null;
        }
        return response as SellerSubscription;
      },
    }),

    subscribeToPlan: builder.mutation<SellerSubscription, SubscribePayload>({
      query: (payload) => ({
        url: "/subscriptions/me",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SellerSubscription"],
    }),

    // Seller Dashboard data
    getSellerProfile: builder.query<SellerProfile | null, void>({
      query: () => ({
        url: "/sellers/me",
      }),
      providesTags: ["SellerProfile"],
    }),

    updateSellerProfile: builder.mutation<
      SellerProfile,
      UpdateSellerProfilePayload
    >({
      query: (body) => ({
        url: "/sellers/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SellerProfile"],
    }),

    getSellerOrders: builder.query<PagedSellerOrders, void>({
      query: () => ({
        url: "/purchases/seller/orders?pageNumber=0&pageSize=20",
      }),
      providesTags: ["SellerOrders"],
    }),

    getSellerReviews: builder.query<PagedSellerReviews, void>({
      query: () => ({
        url: "/reviews/sellers/me?page=0&size=10",
      }),
      providesTags: ["SellerReviews"],
    }),

    getMyListings: builder.query<any, { status?: string; pageNumber?: number; pageSize?: number } | void>({
      query: (params) => {
        const pageNumber = params?.pageNumber ?? 0;
        const pageSize = params?.pageSize ?? 20;
        let url = `/listings/me?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        if (params?.status) url += `&status=${params.status}`;
        return { url };
      },
      providesTags: ["SellerListings"],
    }),
    updateListingStatus: builder.mutation<void, { uuid: string; status: "DRAFT" | "ACTIVE" | "ARCHIVED" }>({
      query: ({ uuid, status }) => ({
        url: `/listings/${encodeURIComponent(uuid)}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["SellerListings"],
    }),
  }),
});

export const {
  useGetSellerApplicationQuery,
  useCreateSellerApplicationMutation,
  useUploadLogoFileMutation,
  useUploadDocumentFileMutation,
  useAttachDocumentMutation,
  useGetSubscriptionPlansQuery,
  useGetSellerSubscriptionQuery,
  useSubscribeToPlanMutation,
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  useGetSellerOrdersQuery,
  useGetSellerReviewsQuery,
  useGetMyListingsQuery,
  useUpdateListingStatusMutation,
} = sellerApi;

