import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PARTY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const partyMasterApi = createApi({
  reducerPath: "partyMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Party"],
  endpoints: (builder) => ({
    getParty: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PARTY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PARTY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Party"],
    }),
    getPartyById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Party"],
    }),
    addParty: builder.mutation({
      query: (payload) => ({
        url: PARTY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Party"],
    }),
    upload: builder.mutation({
      query: (payload) => {
        const { id, body } = payload;
        return {
          url: `${PARTY_API}/upload/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["Party"],
    }),
    updateParty: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${PARTY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Party"],
    }),
    deleteParty: builder.mutation({
      query: (id) => ({
        url: `${PARTY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Party"],
    }),
  }),
});

export const {
  useGetPartyQuery,
  useGetPartyByIdQuery,
  useAddPartyMutation,
  useUpdatePartyMutation,
  useDeletePartyMutation,
  useUploadMutation,
} = partyMasterApi;

export default partyMasterApi;
