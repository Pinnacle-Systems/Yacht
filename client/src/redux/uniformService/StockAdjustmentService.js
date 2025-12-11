import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STOCK_ADJUSTMENT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const StockAdjustmentApi = createApi({
  reducerPath: "StockAdjustment",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["StockAdjustment","OpeningStock"],
  endpoints: (builder) => ({
    getStockAdjustment: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: STOCK_ADJUSTMENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: STOCK_ADJUSTMENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["StockAdjustment"],
    }),
    getStockAdjustmentById: builder.query({
      query: (id) => {
        return {
          url: `${STOCK_ADJUSTMENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["StockAdjustment"],
    }),
    addStockAdjustment: builder.mutation({
      query: (payload) => ({
        url: STOCK_ADJUSTMENT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["StockAdjustment","OpeningStock"],
    }),
    updateStockAdjustment: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${STOCK_ADJUSTMENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["StockAdjustment"],
    }),
    deleteStockAdjustment: builder.mutation({
      query: (id) => ({
        url: `${STOCK_ADJUSTMENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StockAdjustment"],
    }),
    getBarcodeDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${STOCK_ADJUSTMENT_API}/barcode`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["StockAdjustment"],
    }),
  }),
});

export const {
  useGetStockAdjustmentQuery,
  useGetStockAdjustmentByIdQuery,
  useLazyGetStockAdjustmentByIdQuery,
  useAddStockAdjustmentMutation,
  useUpdateStockAdjustmentMutation,
  useDeleteStockAdjustmentMutation,
  useLazyGetBarcodeDetailQuery,
} = StockAdjustmentApi;

export default StockAdjustmentApi;
