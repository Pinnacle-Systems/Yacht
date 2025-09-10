import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PURCHASE_INWARD_ENTRY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const purchaseInwardEntryApi = createApi({
  reducerPath: "purchaseInwardEntry",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["purchaseInwardEntry"],
  endpoints: (builder) => ({
    getPurchaseInwardEntry: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PURCHASE_INWARD_ENTRY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PURCHASE_INWARD_ENTRY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["purchaseInwardEntry"],
    }),

    getPurchaseInwardEntryById: builder.query({
      query: (id) => {
        console.log("Fetching the ID:", id);
        return {
          url: `${PURCHASE_INWARD_ENTRY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["purchaseInwardEntry"],
    }),
    addPurchaseInwardEntry: builder.mutation({
      query: (payload) => ({
        url: PURCHASE_INWARD_ENTRY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["purchaseInwardEntry"],
    }),
    updatePurchaseInwardEntry: builder.mutation({
      query: ({id,body}) => {
        
        return {
          url: `${PURCHASE_INWARD_ENTRY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["purchaseInwardEntry"],
    }),
    deletePurchaseInwardEntry: builder.mutation({
      query: (id) => ({
        url: `${PURCHASE_INWARD_ENTRY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchaseInwardEntry"],
    }),
  }),
});

export const {
  useGetPurchaseInwardEntryQuery,
  useGetPurchaseInwardEntryByIdQuery,
  useAddPurchaseInwardEntryMutation,
  useUpdatePurchaseInwardEntryMutation,
  useDeletePurchaseInwardEntryMutation,
} = purchaseInwardEntryApi;

export default purchaseInwardEntryApi;
