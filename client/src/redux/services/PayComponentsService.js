import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PAY_COMPONENT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PayComponentMasterApi = createApi({
    reducerPath: "payComponent",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["payComponent"],
    endpoints: (builder) => ({
        getPayComponent: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PAY_COMPONENT_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params,
                    };
                }
                return {
                    url: PAY_COMPONENT_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params,
                };
            },
            providesTags: ["payComponent"],
        }),
        getPayComponentById: builder.query({
            query: (id) => {
                return {
                    url: `${PAY_COMPONENT_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["payComponent"],
        }),
        addPayComponent: builder.mutation({
            query: (payload) => ({
                url: PAY_COMPONENT_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["payComponent"],
        }),
        updatePayComponent: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${PAY_COMPONENT_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["payComponent"],
        }),
        deletePayComponent: builder.mutation({
            query: (id) => ({
                url: `${PAY_COMPONENT_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["payComponent"],
        }),
    }),
});

export const {
    useGetPayComponentQuery,
    useGetPayComponentByIdQuery,
    useAddPayComponentMutation,
    useUpdatePayComponentMutation,
    useDeletePayComponentMutation,
} = PayComponentMasterApi;

export default PayComponentMasterApi;
