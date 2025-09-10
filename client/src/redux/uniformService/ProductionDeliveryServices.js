import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {PRODUCTION_DELIVERY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProductionDeliveryApi = createApi({
  reducerPath: "productionDelivery",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ProductionDelivery"],
  endpoints: (builder) => ({
    getProductionDelivery: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PRODUCTION_DELIVERY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PRODUCTION_DELIVERY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["ProductionDelivery"],
    }),
    getProductionDeliveryById: builder.query({
      query: ({id, productionReceiptId}) => {
        return {
          url: `${PRODUCTION_DELIVERY_API}/${id}/${productionReceiptId ? productionReceiptId : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["ProductionDelivery"],
    }),
    addProductionDelivery: builder.mutation({
      query: (payload) => ({
        url: PRODUCTION_DELIVERY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["ProductionDelivery"],
    }),
    updateProductionDelivery: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PRODUCTION_DELIVERY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ProductionDelivery"],
    }),
    deleteProductionDelivery: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTION_DELIVERY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductionDelivery"],
    }),
  }),
});

export const {
  useGetProductionDeliveryQuery,
  useGetProductionDeliveryByIdQuery,
  useAddProductionDeliveryMutation,
  useUpdateProductionDeliveryMutation,
  useDeleteProductionDeliveryMutation,
} = ProductionDeliveryApi;

export default ProductionDeliveryApi;
