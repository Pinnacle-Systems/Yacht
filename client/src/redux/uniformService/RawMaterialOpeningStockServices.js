import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RAW_MATERIAL_OPENING_STOCK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const RawMaterialOpeningStockApi = createApi({
  reducerPath: "RawMaterialOpeningStock",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["RawMaterialOpeningStock"],
  endpoints: (builder) => ({
    getRawMaterialOpeningStock: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: RAW_MATERIAL_OPENING_STOCK_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: RAW_MATERIAL_OPENING_STOCK_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["RawMaterialOpeningStock"],
    }),
    getRawMaterialOpeningStockById: builder.query({
      query: (id) => {
        return {
          url: `${RAW_MATERIAL_OPENING_STOCK_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["RawMaterialOpeningStock"],
    }),
    addRawMaterialOpeningStock: builder.mutation({
      query: (payload) => ({
        url: RAW_MATERIAL_OPENING_STOCK_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["RawMaterialOpeningStock"],
    }),
    updateRawMaterialOpeningStock: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${RAW_MATERIAL_OPENING_STOCK_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["RawMaterialOpeningStock"],
    }),
    deleteRawMaterialOpeningStock: builder.mutation({
      query: (id) => ({
        url: `${RAW_MATERIAL_OPENING_STOCK_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterialOpeningStock"],
    }),
  }),
});

export const {
  useGetRawMaterialOpeningStockQuery,
  useGetRawMaterialOpeningStockByIdQuery,
  useAddRawMaterialOpeningStockMutation,
  useUpdateRawMaterialOpeningStockMutation,
  useDeleteRawMaterialOpeningStockMutation,
} = RawMaterialOpeningStockApi;

export default RawMaterialOpeningStockApi;
