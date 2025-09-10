import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PURCHASE_RETURN_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const purchaseReturnApi = createApi({
  reducerPath: "purchaseReturn",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["PurchaseReturn"],
  endpoints: (builder) => ({
    getPurchaseReturn: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PURCHASE_RETURN_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PURCHASE_RETURN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["PurchaseReturn"],
    }),
    getPurchaseReturnById: builder.query({
      query: (id) => {
        return {
          url: `${PURCHASE_RETURN_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PurchaseReturn"],
    }),
    addPurchaseReturn: builder.mutation({
      query: (payload) => ({
        url: PURCHASE_RETURN_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["PurchaseReturn"],
    }),
    updatePurchaseReturn: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PURCHASE_RETURN_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PurchaseReturn"],
    }),
    deletePurchaseReturn: builder.mutation({
      query: (id) => ({
        url: `${PURCHASE_RETURN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PurchaseReturn"],
    }),
  }),
});

export const {
  useGetPurchaseReturnQuery,
  useGetPurchaseReturnByIdQuery,
  useAddPurchaseReturnMutation,
  useUpdatePurchaseReturnMutation,
  useDeletePurchaseReturnMutation,
} = purchaseReturnApi;

export default purchaseReturnApi;
