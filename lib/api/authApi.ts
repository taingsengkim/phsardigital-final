import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RegisterPayload, RegisterResponse } from "@/app/api/auth";

export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  avatarObjectName?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  bio?: string;
  dateOfBirth?: string;
  status?: string;
  createdAt?: string;
  lastModifiedAt?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  bio?: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  tagTypes: ["UserProfile"],
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterPayload>({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
    }),
    /** POST /api/v1/auth/verify-email/resend — 202, no body. */
    resendVerificationEmail: builder.mutation<unknown, string>({
      query: (email) => ({
        url: "/auth/verify-email/resend",
        method: "POST",
        body: { email },
      }),
    }),

    getMe: builder.query<UserProfile, string | void>({
      query: (accessToken) => ({
        url: "/user-profiles/me",
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      }),
      providesTags: ["UserProfile"],
    }),
    updateMe: builder.mutation<
      UserProfile,
      { accessToken?: string; body: UpdateUserProfileRequest }
    >({
      query: ({ accessToken, body }) => ({
        url: "/user-profiles/me",
        method: "PATCH",
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
        body,
      }),
      invalidatesTags: ["UserProfile"],
    }),
    uploadAvatar: builder.mutation<
      UserProfile,
      { accessToken?: string; file: File }
    >({
      query: ({ accessToken, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/user-profiles/me/avatar",
          method: "POST",
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
          body: formData,
        };
      },
      invalidatesTags: ["UserProfile"],
    }),
    deleteAvatar: builder.mutation<UserProfile, string | void>({
      query: (accessToken) => ({
        url: "/user-profiles/me/avatar",
        method: "DELETE",
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      }),
      invalidatesTags: ["UserProfile"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useResendVerificationEmailMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
} = authApi;
