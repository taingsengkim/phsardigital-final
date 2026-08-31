import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type DocumentType = "ID_CARD" | "BUSINESS_LICENSE" | "OTHER";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "NOT_FOUND";

export interface SellerDocument {
  uuid: string;
  docType: DocumentType;
  objectName: string;
  uri: string;
}

export interface SellerApplication {
  uuid: string;
  applicantId?: string;
  businessName: string;
  businessType?: "INDIVIDUAL" | "SOLE_PROPRIETORSHIP" | "PARTNERSHIP" | "COMPANY";
  description?: string;
  logoObjectName?: string;
  logoUri?: string;
  address?: string;
  city?: string;
  province?: string;
  googleMapUrl?: string;
  latitude?: number;
  longitude?: number;
  status: ApplicationStatus;
  rejectionNote?: string | null;
  missingDocuments?: DocumentType[];
  documents?: SellerDocument[];
  reviewedAt?: string;
  createdAt?: string;
}

export interface CreateSellerApplicationPayload {
  businessName: string;
  businessType?: "INDIVIDUAL" | "SOLE_PROPRIETORSHIP" | "PARTNERSHIP" | "COMPANY";
  description?: string;
  logoObjectName?: string;
  address?: string;
  city?: string;
  province?: string;
  googleMapUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface UploadFileResponse {
  objectName: string;
  uri?: string;
}

export interface UploadDocumentResponse {
  uuid: string;
  docType: DocumentType;
  objectName: string;
  uri: string;
}

export interface AttachDocumentPayload {
  docType: DocumentType;
  objectName: string;
}

/**
 * Admins create and retire plans at runtime, so a plan code is an opaque
 * string ("BASIC", "PRO_2027", …) and never a union baked into the frontend.
 * `code` is the immutable identity; `displayName` is the label to show.
 */
export interface SubscriptionPlan {
  code: string;
  displayName: string;
  priceUsd: number;
  durationDays: number;
  /** null means unlimited. */
  listingLimit: number | null;
  /** false = retired: still honoured for current subscribers, not sellable. */
  active: boolean;
  sortOrder: number;
}

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface SellerSubscription {
  sellerId: string;
  planCode: string;
  planDisplayName: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string;
  listingsUsed: number;
  /** null means unlimited. */
  listingLimit: number | null;
  canPostListing: boolean;
  canChat: boolean;
}

export type PaymentStatus = "PENDING" | "PAID" | "EXPIRED";

export interface Payment {
  uuid: string;
  purpose: string;
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** false once the payment settled or the QR lapsed — the server's truth. */
  payable: boolean;
  /** An EMVCo payload string to render as a QR client-side, not an image URL. */
  qr: string;
  md5: string;
  /** ISO local date-time with NO timezone offset, e.g. "2026-09-01T14:35:00". */
  expiresAt: string;
  paidAt: string | null;
}

/**
 * POST /subscriptions/me no longer grants anything: it opens a checkout and
 * the plan starts only once Bakong confirms the transfer. A free plan is the
 * one exception — branch on `paymentRequired`, never on the price.
 */
export interface SubscriptionCheckout {
  planCode: string;
  planDisplayName: string;
  priceUsd: number;
  durationDays: number;
  paymentRequired: boolean;
  payment: Payment | null;
  subscription: SellerSubscription | null;
}

export interface SubscribePayload {
  planCode: string;
}

export interface PagedPayments {
  content: Payment[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
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
      // The catalogue is admin-ordered, and the endpoint already filters out
      // retired plans; sorting here keeps every caller off sortOrder.
      transformResponse: (response: SubscriptionPlan[] | null) =>
        [...(response ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    }),

    getSellerSubscription: builder.query<SellerSubscription | null, void>({
      query: () => ({
        url: "/subscriptions/me",
      }),
      providesTags: ["SellerSubscription"],
      // A 404 upstream means "never subscribed", which the proxy turns into a
      // null body — that is the pricing page, not an error.
      transformResponse: (response: any) => {
        if (!response || response.notFound) {
          return null;
        }
        return response as SellerSubscription;
      },
    }),

    subscribeToPlan: builder.mutation<SubscriptionCheckout, SubscribePayload>({
      query: (payload) => ({
        url: "/subscriptions/me",
        method: "POST",
        body: payload,
      }),
      // A paid checkout grants nothing yet, so there is nothing to invalidate
      // until the poll confirms it. Only the free-plan branch is active now.
      invalidatesTags: (result) =>
        result?.subscription ? ["SellerSubscription"] : [],
    }),

    /**
     * Asks Bakong whether the transfer landed and activates the plan when it
     * has. Safe to call repeatedly — it settles at most once.
     */
    verifyPayment: builder.mutation<Payment, string>({
      query: (uuid) => ({
        url: `/payments/${encodeURIComponent(uuid)}/verify`,
        method: "POST",
      }),
      invalidatesTags: (result) =>
        result?.status === "PAID" ? ["SellerSubscription"] : [],
    }),

    /** One payment, read back without asking Bakong. */
    getPayment: builder.query<Payment, string>({
      query: (uuid) => ({
        url: `/payments/${encodeURIComponent(uuid)}`,
      }),
    }),

    /** The signed-in seller's own payment history — never anyone else's. */
    getMyPayments: builder.query<
      PagedPayments,
      { pageNumber?: number; pageSize?: number } | void
    >({
      query: (params) => ({
        url: `/payments?pageNumber=${params?.pageNumber ?? 0}&pageSize=${params?.pageSize ?? 20}`,
      }),
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
  useVerifyPaymentMutation,
  useGetPaymentQuery,
  useGetMyPaymentsQuery,
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  useGetSellerOrdersQuery,
  useGetSellerReviewsQuery,
  useGetMyListingsQuery,
  useUpdateListingStatusMutation,
} = sellerApi;

