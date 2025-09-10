import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DIRECT_INWARD_OR_RETURN_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DirectInwardOrReturnApi = createApi({
  reducerPath: "directInwardOrReturn",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["DirectInwardOrReturn"],
  endpoints: (builder) => ({
    getDirectInwardOrReturn: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DIRECT_INWARD_OR_RETURN_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: DIRECT_INWARD_OR_RETURN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["DirectInwardOrReturn"],
    }),
    getDirectInwardOrReturnById: builder.query({
      query: (id) => {
        return {
          url: `${DIRECT_INWARD_OR_RETURN_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["DirectInwardOrReturn"],
    }),
    getDirectItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${DIRECT_INWARD_OR_RETURN_API}/getDirectItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["DirectInwardOrReturn"],
    }),
    getPoItemsandDirectInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${DIRECT_INWARD_OR_RETURN_API}/getPoItemsandDirectInwardItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["DirectInwardOrReturn"],
    }),
    getDirectItemById: builder.query({
      query: ({ id, purchaseInwardId, stockId, storeId, billEntryId }) => {
        return {
          url: `${DIRECT_INWARD_OR_RETURN_API}/getDirectItems/${id}/${purchaseInwardId ? purchaseInwardId : null}/${stockId ? stockId : null}/${storeId ? storeId : null}/${billEntryId ? billEntryId : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["DirectInwardOrReturn"],
    }),

    addDirectInwardOrReturn: builder.mutation({
      query: (payload) => ({
        url: DIRECT_INWARD_OR_RETURN_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["DirectInwardOrReturn"],
    }),
    updateDirectInwardOrReturn: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${DIRECT_INWARD_OR_RETURN_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["DirectInwardOrReturn"],
    }),
    deleteDirectInwardOrReturn: builder.mutation({
      query: (id) => ({
        url: `${DIRECT_INWARD_OR_RETURN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DirectInwardOrReturn"],
    }),
  }),
});

export const {
  useGetDirectInwardOrReturnQuery,
  useGetDirectInwardOrReturnByIdQuery,
  useGetPoItemsandDirectInwardItemsQuery,
  useGetDirectItemsQuery,
  useGetDirectItemByIdQuery,
  useAddDirectInwardOrReturnMutation,
  useUpdateDirectInwardOrReturnMutation,
  useDeleteDirectInwardOrReturnMutation,
} = DirectInwardOrReturnApi;

export default DirectInwardOrReturnApi;
