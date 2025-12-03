import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STOCK_INWARD_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const StockInwardApi = createApi({
  reducerPath: "StockInward",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["StockInward"],
  endpoints: (builder) => ({
    getStockInward: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: STOCK_INWARD_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: STOCK_INWARD_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["StockInward"],
    }),
    getStockInwardById: builder.query({
      query: (id) => {
        return {
          url: `${STOCK_INWARD_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["StockInward"],
    }),
    addStockInward: builder.mutation({
      query: (payload) => ({
        url: STOCK_INWARD_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["StockInward"],
    }),
    updateStockInward: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${STOCK_INWARD_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["StockInward"],
    }),
    deleteStockInward: builder.mutation({
      query: (id) => ({
        url: `${STOCK_INWARD_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StockInward"],
    }),
  }),
});

export const {
  useGetStockInwardQuery,
  useGetStockInwardByIdQuery,
  useLazyGetStockInwardByIdQuery,
  useAddStockInwardMutation,
  useUpdateStockInwardMutation,
  useDeleteStockInwardMutation,
} = StockInwardApi;

export default StockInwardApi;
