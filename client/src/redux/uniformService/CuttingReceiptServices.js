import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {CUTTING_RECEIPT_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const CuttingReceiptApi = createApi({
  reducerPath: "cuttingReceipt",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["CuttingReceipt"],
  endpoints: (builder) => ({
    getCuttingReceipt: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: CUTTING_RECEIPT_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: CUTTING_RECEIPT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["CuttingReceipt"],
    }),
    getCuttingReceiptById: builder.query({
      query: (id) => {
        return {
          url: `${CUTTING_RECEIPT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["CuttingReceipt"],
    }),
    getCuttingOrderDetailAllReadyReceivedQtyt: builder.query({
      query: ({id, cuttingReceiptInwardDetailsId}) => {
        return {
          url: `${CUTTING_RECEIPT_API}/getCuttingOrderDetailAllReadyReceivedQty/${id}/${cuttingReceiptInwardDetailsId}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["CuttingReceipt"],
    }),
    getCuttingOrderDeliveryDetailAllReadyConsumedQty: builder.query({
      query: ({id, cuttingReceiptInwardDetailsId}) => {
        return {
          url: `${CUTTING_RECEIPT_API}/getCuttingOrderDeliveryDetailAllReadyConsumedQty/${id}/${cuttingReceiptInwardDetailsId}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["CuttingReceipt"],
    }),
    addCuttingReceipt: builder.mutation({
      query: (payload) => ({
        url: CUTTING_RECEIPT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["CuttingReceipt"],
    }),
    updateCuttingReceipt: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${CUTTING_RECEIPT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["CuttingReceipt"],
    }),
    deleteCuttingReceipt: builder.mutation({
      query: (id) => ({
        url: `${CUTTING_RECEIPT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CuttingReceipt"],
    }),
  }),
});

export const {
  useGetCuttingReceiptQuery,
  useGetCuttingReceiptByIdQuery,
  useAddCuttingReceiptMutation,
  useGetCuttingOrderDetailAllReadyReceivedQtytQuery,
  useGetCuttingOrderDeliveryDetailAllReadyConsumedQtyQuery,
  useUpdateCuttingReceiptMutation,
  useDeleteCuttingReceiptMutation,
} = CuttingReceiptApi;

export default CuttingReceiptApi;
