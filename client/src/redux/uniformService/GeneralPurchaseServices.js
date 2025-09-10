import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  GENERALPURCHASE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const GeneralPurchaseApi = createApi({
  reducerPath: "generalPurchase",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["generalPurchase"],
  endpoints: (builder) => ({
    getGeneralPurchase: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: GENERALPURCHASE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url:GENERALPURCHASE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["generalPurchase"],
    }),
    getGeneralPurchaseItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${GENERALPURCHASE_API}/getPoItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["generalPurchase"],
    }),
    getGeneralPurchaseItemById: builder.query({
      query: ({ id, purchaseInwardId, stockId, storeId, billEntryId, poType }) => {
        return {
          url: `${GENERALPURCHASE_API}/getPoItems/${id}/${purchaseInwardId ? purchaseInwardId : null}/${stockId ? stockId : null}/${storeId ? storeId : null}/${billEntryId ? billEntryId : null}/${poType ? poType : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["generalPurchase"],
    }),
    getGeneralPurchaseById: builder.query({
      query: (id) => {
        return {
          url: `${GENERALPURCHASE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["generalPurchase"],
    }),
    addGeneralPurchase: builder.mutation({
      query: (payload) => ({
        url: GENERALPURCHASE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["generalPurchase"],
    }),
    updateGeneralPurchase: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${GENERALPURCHASE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["generalPurchase"],
    }),
    deleteGeneralPurchase: builder.mutation({
      query: (id) => ({
        url: `${GENERALPURCHASE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["generalPurchase"],
    }),
  }),
});

export const {
  useGetGeneralPurchaseQuery,
  useGetGeneralPurchaseByIdQuery,
  useGetGeneralPurchaseItemsQuery,
  useGetGeneralPurchaseItemByIdQuery,
  useAddGeneralPurchaseMutation,
  useUpdateGeneralPurchaseMutation,
  useDeleteGeneralPurchaseMutation,
} = GeneralPurchaseApi;

export default GeneralPurchaseApi;
