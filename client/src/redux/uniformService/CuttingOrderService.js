import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { CUTTING_ORDER_API } from "../../Api";
const BASE_URL = process.env.REACT_APP_SERVER_URL;
const CuttingOrderApi = createApi({
    reducerPath: "CuttingOrder",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["CuttingOrder"],
    endpoints: (builder) => ({
        getCuttingOrder: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: CUTTING_ORDER_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: CUTTING_ORDER_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["CuttingOrder"],
        }),
        getCuttingOrderById: builder.query({
            query: ({ id, cuttingReceiptId, cuttingExcessFabricReturnId }) => {
                return {
                    // url: `${CUTTING_ORDER_API}/${id}`,
                    url: `${CUTTING_ORDER_API}/${id}/${cuttingReceiptId ? cuttingReceiptId : null}/${cuttingExcessFabricReturnId ? cuttingExcessFabricReturnId : null}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["CuttingOrder"],
        }),
        addCuttingOrder: builder.mutation({
            query: (payload) => ({
                url: CUTTING_ORDER_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["CuttingOrder"],
        }),
        updateCuttingOrder: builder.mutation({
            query: (payload) => {
                const { id, body } = payload;
                return {
                    url: `${CUTTING_ORDER_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["CuttingOrder"],
        }),
        deleteCuttingOrder: builder.mutation({
            query: (id) => ({
                url: `${CUTTING_ORDER_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["CuttingOrder"],
        }),
    }),
});

export const {
    useLazyGetCuttingOrderQuery,
    useGetCuttingOrderQuery,
    useGetCuttingOrderByIdQuery,
    useAddCuttingOrderMutation,
    useUpdateCuttingOrderMutation,
    useDeleteCuttingOrderMutation,
} = CuttingOrderApi;

export default CuttingOrderApi;
