import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { ORDER_IMPORT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const OrderImportApi = createApi({
    reducerPath: "orderImport",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["OrderImport"],
    endpoints: (builder) => ({
        getOrderImport: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ORDER_IMPORT_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ORDER_IMPORT_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["OrderImport"],
        }),
        getOrderImportById: builder.query({
            query: (id) => {
                return {
                    url: `${ORDER_IMPORT_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["OrderImport"],
        }),
        addOrderImport: builder.mutation({
            query: (payload) => ({
                url: ORDER_IMPORT_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["OrderImport"],
        }),
        updateOrderImport: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${ORDER_IMPORT_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["OrderImport"],
        }),
        deleteOrderImport: builder.mutation({
            query: (id) => ({
                url: `${ORDER_IMPORT_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["OrderImport"],
        }),
    }),
});

export const {
    useGetOrderImportQuery,
    useGetOrderImportByIdQuery,
    useAddOrderImportMutation,
    useUpdateOrderImportMutation,
    useDeleteOrderImportMutation,
} = OrderImportApi;

export default OrderImportApi;
