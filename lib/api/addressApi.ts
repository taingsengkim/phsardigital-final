import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** Mirrors AddressResponse from the platform API. */
export interface Address {
  id: string;
  label?: string | null;
  recipient?: string | null;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  province?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean | null;
}

/** Mirrors AddressRequest — `line1` is the only field the API requires. */
export interface CreateAddressRequest {
  label?: string;
  recipient?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

/** Mirrors UpdateAddressRequest — accepts isDefault since the 18 Aug 2026 update. */
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
