import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PURCHASE_RETURN_SHOWROOM_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const purchaseReturnShowroomApi = createApi({
  reducerPath: "purchaseReturnShowroom",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["PurchaseReturnShowroom"],
  endpoints: (builder) => ({
    getPurchaseReturnShowroom: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PURCHASE_RETURN_SHOWROOM_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PURCHASE_RETURN_SHOWROOM_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["PurchaseReturnShowroom"],
    }),
    getPurchaseReturnShowroomById: builder.query({
      query: (id) => {
        return {
          url: `${PURCHASE_RETURN_SHOWROOM_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PurchaseReturnShowroom"],
    }),
    addPurchaseReturnShowroom: builder.mutation({
      query: (payload) => ({
        url: PURCHASE_RETURN_SHOWROOM_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["PurchaseReturnShowroom"],
    }),
    updatePurchaseReturnShowroom: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PURCHASE_RETURN_SHOWROOM_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PurchaseReturnShowroom"],
    }),
    deletePurchaseReturnShowroom: builder.mutation({
      query: (id) => ({
        url: `${PURCHASE_RETURN_SHOWROOM_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PurchaseReturnShowroom"],
    }),
  }),
});

export const {
  useGetPurchaseReturnShowroomQuery,
  useGetPurchaseReturnShowroomByIdQuery,
  useLazyGetPurchaseReturnShowroomByIdQuery,
  useAddPurchaseReturnShowroomMutation,
  useUpdatePurchaseReturnShowroomMutation,
  useDeletePurchaseReturnShowroomMutation,
} = purchaseReturnShowroomApi;

export default purchaseReturnShowroomApi;
