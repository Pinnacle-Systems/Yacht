import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {PRODUCTION_RECEIPT_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProductionReceiptApi = createApi({
  reducerPath: "ProductionReceipt",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ProductionReceipt"],
  endpoints: (builder) => ({
    getProductionReceipt: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PRODUCTION_RECEIPT_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PRODUCTION_RECEIPT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["ProductionReceipt"],
    }),
    getProductionReceiptById: builder.query({
      query: ({id}) => {
        return {
          url: `${PRODUCTION_RECEIPT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["ProductionReceipt"],
    }),
    addProductionReceipt: builder.mutation({
      query: (payload) => ({
        url: PRODUCTION_RECEIPT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["ProductionReceipt"],
    }),
    updateProductionReceipt: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PRODUCTION_RECEIPT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ProductionReceipt"],
    }),
    deleteProductionReceipt: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTION_RECEIPT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductionReceipt"],
    }),
  }),
});

export const {
  useGetProductionReceiptQuery,
  useGetProductionReceiptByIdQuery,
  useAddProductionReceiptMutation,
  useUpdateProductionReceiptMutation,
  useDeleteProductionReceiptMutation,
} = ProductionReceiptApi;

export default ProductionReceiptApi;
