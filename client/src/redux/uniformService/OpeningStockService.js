import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OPENING_STOCK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const OpeningStockApi = createApi({
  reducerPath: "OpeningStock",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["OpeningStock"],
  endpoints: (builder) => ({
    getOpeningStock: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: OPENING_STOCK_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: OPENING_STOCK_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["OpeningStock"],
    }),
    getOpeningStockById: builder.query({
      query: (id) => {
        return {
          url: `${OPENING_STOCK_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["OpeningStock"],
    }),
    addOpeningStock: builder.mutation({
      query: (payload) => ({
        url: OPENING_STOCK_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["OpeningStock"],
    }),
    updateOpeningStock: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${OPENING_STOCK_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["OpeningStock"],
    }),
    deleteOpeningStock: builder.mutation({
      query: (id) => ({
        url: `${OPENING_STOCK_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OpeningStock"],
    }),
  }),
});

export const {
  useGetOpeningStockQuery,
  useGetOpeningStockByIdQuery,
  useAddOpeningStockMutation,
  useUpdateOpeningStockMutation,
  useDeleteOpeningStockMutation,
} = OpeningStockApi;

export default OpeningStockApi;
