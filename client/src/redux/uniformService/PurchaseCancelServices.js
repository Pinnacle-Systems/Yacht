import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PURCHASE_CANCEL_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PurchaseCancelApi = createApi({
    reducerPath: "purchaseCancel",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["PurchaseCancel"],
    endpoints: (builder) => ({
        getPurchaseCancel: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PURCHASE_CANCEL_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: PURCHASE_CANCEL_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["PurchaseCancel"],
        }),
        getPurchaseCancelById: builder.query({
            query: (id) => {
                return {
                    url: `${PURCHASE_CANCEL_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["PurchaseCancel"],
        }),
        getDirectItems: builder.query({
            query: ({ params }) => {
                return {
                    url: `${PURCHASE_CANCEL_API}/getDirectItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["PurchaseCancel"],
        }),
        getPoItemsandDirectInwardItems: builder.query({
            query: ({ params }) => {
                return {
                    url: `${PURCHASE_CANCEL_API}/getPoItemsandDirectInwardItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["PurchaseCancel"],
        }),
        getDirectItemById: builder.query({
            query: ({ id, purchaseInwardId, stockId, storeId, billEntryId }) => {
                return {
                    url: `${PURCHASE_CANCEL_API}/getDirectItems/${id}/${purchaseInwardId ? purchaseInwardId : null}/${stockId ? stockId : null}/${storeId ? storeId : null}/${billEntryId ? billEntryId : null}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["PurchaseCancel"],
        }),

        addPurchaseCancel: builder.mutation({
            query: (payload) => ({
                url: PURCHASE_CANCEL_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["PurchaseCancel"],
        }),
        updatePurchaseCancel: builder.mutation({
            query: ({ id, ...body }) => {
                return {
                    url: `${PURCHASE_CANCEL_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["PurchaseCancel"],
        }),
        deletePurchaseCancel: builder.mutation({
            query: (id) => ({
                url: `${PURCHASE_CANCEL_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PurchaseCancel"],
        }),
    }),
});

export const {
    useGetPurchaseCancelQuery,
    useGetPurchaseCancelByIdQuery,
    useGetPoItemsandDirectInwardItemsQuery,
    useGetDirectItemsQuery,
    useGetDirectItemByIdQuery,
    useAddPurchaseCancelMutation,
    useUpdatePurchaseCancelMutation,
    useDeletePurchaseCancelMutation,
} = PurchaseCancelApi;

export default PurchaseCancelApi;
