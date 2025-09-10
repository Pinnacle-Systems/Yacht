import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PAY_FREQUENCY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PayFrequencyMasterApi = createApi({
    reducerPath: "payFrequency",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["PayFrequency"],
    endpoints: (builder) => ({
        getPayFrequency: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PAY_FREQUENCY_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params,
                    };
                }
                return {
                    url: PAY_FREQUENCY_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params,
                };
            },
            providesTags: ["PayFrequency"],
        }),
        getPayFrequencyById: builder.query({
            query: (id) => {
                return {
                    url: `${PAY_FREQUENCY_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["PayFrequency"],
        }),
        addPayFrequency: builder.mutation({
            query: (payload) => ({
                url: PAY_FREQUENCY_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["PayFrequency"],
        }),
        updatePayFrequency: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${PAY_FREQUENCY_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["PayFrequency"],
        }),
        deletePayFrequency: builder.mutation({
            query: (id) => ({
                url: `${PAY_FREQUENCY_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PayFrequency"],
        }),
    }),
});

export const {
    useGetPayFrequencyQuery,
    useGetPayFrequencyByIdQuery,
    useAddPayFrequencyMutation,
    useUpdatePayFrequencyMutation,
    useDeletePayFrequencyMutation,
} = PayFrequencyMasterApi;

export default PayFrequencyMasterApi;
