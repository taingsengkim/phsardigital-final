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

export const sellerApi = createApi({
  reducerPath: "sellerApi",
  tagTypes: ["SellerApplication"],
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
  }),
});

export const {
  useGetSellerApplicationQuery,
  useCreateSellerApplicationMutation,
  useUploadLogoFileMutation,
  useUploadDocumentFileMutation,
  useAttachDocumentMutation,
} = sellerApi;
