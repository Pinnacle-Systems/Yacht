import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OPENING_STOCK_SR_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const OpeningStockSRApi = createApi({
  reducerPath: "OpeningStockSR",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["OpeningStockSR"],
  endpoints: (builder) => ({
    getOpeningStockSR: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: OPENING_STOCK_SR_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: OPENING_STOCK_SR_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["OpeningStockSR"],
    }),
    getOpeningStockSRById: builder.query({
      query: (id) => {
        return {
          url: `${OPENING_STOCK_SR_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["OpeningStockSR"],
    }),
    addOpeningStockSR: builder.mutation({
      query: (payload) => ({
        url: OPENING_STOCK_SR_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["OpeningStockSR"],
    }),
    updateOpeningStockSR: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${OPENING_STOCK_SR_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["OpeningStockSR"],
    }),
    deleteOpeningStockSR: builder.mutation({
      query: (id) => ({
        url: `${OPENING_STOCK_SR_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OpeningStockSR"],
    }),
  }),
});

export const {
  useGetOpeningStockSRQuery,
  useLazyGetOpeningStockSRQuery,
  useGetOpeningStockSRByIdQuery,
  useLazyGetOpeningStockSRByIdQuery,
  useAddOpeningStockSRMutation,
  useUpdateOpeningStockSRMutation,
  useDeleteOpeningStockSRMutation,
} = OpeningStockSRApi;

export default OpeningStockSRApi;
