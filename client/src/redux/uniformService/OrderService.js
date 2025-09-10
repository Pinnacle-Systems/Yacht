import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { ORDER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const OrderApi = createApi({
    reducerPath: "Order",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["Order"],
    endpoints: (builder) => ({
        getOrder: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ORDER_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ORDER_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["Order"],
        }),
        // getFilterOrder :  builder.query({
        //     query: ({ params, searchParams }) => {
        //         if (searchParams) {
        //             return {
        //                 url: ORDER_API + "/search/" + searchParams,
        //                 method: "GET",
        //                 headers: {
        //                     "Content-type": "application/json; charset=UTF-8",
        //                 },
        //                 params
        //             };
        //         }
        //         return {
        //             url: ORDER_API + "filter",
        //             method: "GET",
        //             headers: {
        //                 "Content-type": "application/json; charset=UTF-8",
        //             },
        //             params
        //         };
        //     },
        //     providesTags: ["Order"],
        // }),
        getOrderById: builder.query({
            query: (id) => {
             console.log(id,"inservice");
             
               
                return {
                    url: `${ORDER_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Order"],
        }),
        getFilterOrderById :builder.query({
            query: (id) => {
              
               
                return {
                    url: `${ORDER_API}/filter/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Order"],
        }),
        getOrderItemsById: builder.query({
            query: ({ id, prevProcessId, packingCategory, packingType }) => {
                return {
                    url: `${ORDER_API}/getOrderItems/${id}/${prevProcessId ? prevProcessId : null}/${packingCategory ? packingCategory : null}/${packingType ? packingType : null}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Order"],
        }),
        addOrder: builder.mutation({
            query: (payload) => ({
                url: ORDER_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Order"],
        }),
        upload: builder.mutation({
            query: (payload) => {
                const { body } = payload;
                return {
                    url: `${ORDER_API}/upload`,
                    method: "POST",
                    body
                };
            },
            invalidatesTags: ["Order"],
        }),
        updateOrder: builder.mutation({
            query: (payload) => {
                const { id, body } = payload;
                return {
                    url: `${ORDER_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["Order"],
        }),
        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `${ORDER_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Order"],
        }),
        attachOrder: builder.mutation({
            query: (payload) => {
                const { body } = payload;
                return {
                    url: `${ORDER_API}/attach`,
                    method: "POST",
                    body
                };
            },
            invalidatesTags: ["Order"],
        }),
    }),
});

export const {
    useLazyGetOrderQuery,
    useGetOrderQuery,
    useGetOrderByIdQuery,
    useGetOrderItemsByIdQuery,
    useAddOrderMutation,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useUploadMutation,
    useAttachOrderMutation,
    // useGetFilterOrderQuery
    useGetFilterOrderByIdQuery,
    useLazyGetFilterOrderByIdQuery
} = OrderApi;

export default OrderApi;
