import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** Mirrors AddressResponse. */
export interface Address {
  id: string;
  /** Cambodian addressing splits at the capital: CITY means Phnom Penh. */
  type?: "PROVINCE" | "CITY" | null;
  label?: string | null;
  recipient?: string | null;
  phone?: string | null;
  locationName?: string | null;
  streetNo?: string | null;
  province?: string | null;
  district?: string | null;
  commune?: string | null;
  village?: string | null;
  /** Server-composed one-line address; read-only. */
  formattedAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean | null;
  landmarkPhotos?: { url?: string; caption?: string }[] | null;
}

/** Mirrors AddressRequest. Every field is optional. */
export interface CreateAddressRequest {
  type?: "PROVINCE" | "CITY";
  label?: string;
  recipient?: string;
  phone?: string;
  locationName?: string;
  streetNo?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  /** objectName comes from a file upload; at most three. */
  landmarkPhotos?: { objectName: string; caption?: string }[];
}

/** Mirrors UpdateAddressRequest — the same fields, all optional. */
export type UpdateAddressRequest = Partial<CreateAddressRequest>;

export const addressApi = createApi({
  reducerPath: "addressApi",
  tagTypes: ["Address"],
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>({
      query: () => ({ url: "/addresses" }),
      // The upstream may answer with a bare array or a paged envelope.
      transformResponse: (response: Address[] | { content?: Address[] }) =>
        Array.isArray(response) ? response : (response?.content ?? []),
      providesTags: ["Address"],
    }),

    createAddress: builder.mutation<Address, CreateAddressRequest>({
      query: (body) => ({
        url: "/addresses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Address"],
    }),

    updateAddress: builder.mutation<
      Address,
      { id: string; body: UpdateAddressRequest }
    >({
      query: ({ id, body }) => ({
        url: `/addresses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Address"],
    }),

    deleteAddress: builder.mutation<void, string>({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),

    makeAddressDefault: builder.mutation<Address, string>({
      query: (id) => ({
        url: `/addresses/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: ["Address"],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useMakeAddressDefaultMutation,
} = addressApi;
