import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_ENTRY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SalesEntryApi = createApi({
  reducerPath: "SalesEntry",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["SalesEntry"],
  endpoints: (builder) => ({
    getSalesEntry: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SALES_ENTRY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: SALES_ENTRY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["SalesEntry"],
    }),
    getSalesEntryById: builder.query({
      query: (id) => {
        return {
          url: `${SALES_ENTRY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["SalesEntry"],
    }),
    getSalesReport: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SALES_ENTRY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: `${SALES_ENTRY_API}/salesReport`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["SalesEntry"],
    }),
    getSalesInvDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${SALES_ENTRY_API}/salesInvDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["SalesEntry"],
    }),
    getSalesDCDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${SALES_ENTRY_API}/salesDCDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["SalesEntry"],
    }),
    getSalesInvStyleDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${SALES_ENTRY_API}/salesInvStyleDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["SalesEntry"],
    }),
    getSalesBarcodeStyleDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${SALES_ENTRY_API}/salesInvBarcodeDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["SalesEntry"],
    }),
    addSalesEntry: builder.mutation({
      query: (payload) => ({
        url: SALES_ENTRY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["SalesEntry"],
    }),
    updateSalesEntry: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${SALES_ENTRY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["SalesEntry"],
    }),
    deleteSalesEntry: builder.mutation({
      query: (id) => ({
        url: `${SALES_ENTRY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesEntry"],
    }),
  }),
});

export const {
  useGetSalesEntryQuery,
  useGetSalesEntryByIdQuery,
  useLazyGetSalesEntryByIdQuery,
  useGetSalesReportQuery,
  useLazyGetSalesInvDetailQuery,
  useLazyGetSalesDCDetailQuery,
  useLazyGetSalesInvStyleDetailQuery,
  useLazyGetSalesBarcodeStyleDetailQuery,
  useAddSalesEntryMutation,
  useUpdateSalesEntryMutation,
  useDeleteSalesEntryMutation,
} = SalesEntryApi;

export default SalesEntryApi;
