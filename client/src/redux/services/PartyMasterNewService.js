import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PARTY_MASTER_NEW_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const partyMasterNewApi = createApi({
  reducerPath: "partyMasterNew",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["PartyNew"],
  endpoints: (builder) => ({
    getPartyNew: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PARTY_MASTER_NEW_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PARTY_MASTER_NEW_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["PartyNew"],
    }),
    getPartyNewById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_MASTER_NEW_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PartyNew"],
    }),
    addPartyNew: builder.mutation({
      query: (payload) => ({
        url: PARTY_MASTER_NEW_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["PartyNew"],
    }),
    uploadParty: builder.mutation({
      query: (payload) => {
        const { id, body } = payload;
        return {
          url: `${PARTY_MASTER_NEW_API}/upload/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["PartyNew"],
    }),
    updatePartyNew: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${PARTY_MASTER_NEW_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PartyNew"],
    }),
    deletePartyNew: builder.mutation({
      query: (id) => ({
        url: `${PARTY_MASTER_NEW_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Party"],
    }),
  }),
});

export const {
  useGetPartyNewQuery,
  useGetPartyNewByIdQuery,
  useAddPartyNewMutation,
  useUpdatePartyNewMutation,
  useDeletePartyNewMutation,
  useUploadPartyMutation,
} = partyMasterNewApi;

export default partyMasterNewApi;
