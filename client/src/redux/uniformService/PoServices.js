import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PO_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PoApi = createApi({
  reducerPath: "po",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["po"],
  endpoints: (builder) => ({
    getPo: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PO_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PO_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["po"],
    }),
    getPoItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${PO_API}/getPoItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["po"],
    }),
    getPoItemById: builder.query({
      query: ({ id, purchaseInwardId, stockId, storeId, billEntryId, poType }) => {
        return {
          url: `${PO_API}/getPoItems/${id}/${purchaseInwardId ? purchaseInwardId : null}/${stockId ? stockId : null}/${storeId ? storeId : null}/${billEntryId ? billEntryId : null}/${poType ? poType : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["po"],
    }),
    getPoById: builder.query({
      query: (id) => {
        return {
          url: `${PO_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["po"],
    }),
    addPo: builder.mutation({
      query: (payload) => ({
        url: PO_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["po"],
    }),
    updatePo: builder.mutation({
      query: ({id,body}) => {
        
        return {
          url: `${PO_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["po"],
    }),
    deletePo: builder.mutation({
      query: (id) => ({
        url: `${PO_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["po"],
    }),
  }),
});

export const {
  useGetPoQuery,
  useGetPoByIdQuery,
  useGetPoItemsQuery,
  useGetPoItemByIdQuery,
  useAddPoMutation,
  useUpdatePoMutation,
  useDeletePoMutation,
} = PoApi;

export default PoApi;
