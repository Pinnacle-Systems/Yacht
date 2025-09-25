import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STOCK_ADJUSTMENT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const StockAdjustmentApi = createApi({
  reducerPath: "stockAdjustment",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["StockAdjustment"],
  endpoints: (builder) => ({
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
    deleteStockAdjustment: builder.mutation({
      query: (id) => ({
        url: `${STOCK_ADJUSTMENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StockAdjustment"],
    }),
  }),
});

export const {
  useGetStockAdjustmentByIdQuery,
  useDeleteStockAdjustmentMutation,
} = StockAdjustmentApi;

export default StockAdjustmentApi;
