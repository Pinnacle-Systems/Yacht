import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { PERCENTAGE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PercentageApi = createApi({
    reducerPath: "percentageMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["Percentage"],
    endpoints: (builder) => ({
        getPercentage: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PERCENTAGE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: PERCENTAGE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["Percentage"],
        }),
        getPercentageById: builder.query({
            query: (id) => {
                return {
                    url: `${PERCENTAGE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Percentage"],
        }),
        getPercentageItemsById: builder.query({
            query: ({ id, prevProcessId, packingCategory, packingType }) => {
                return {
                    url: `${PERCENTAGE_API}/getOrderItems/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Percentage"],
        }),
        addPercentage: builder.mutation({
            query: (payload) => ({
                url: PERCENTAGE_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Order"],
        }),
        upload: builder.mutation({
            query: (payload) => {
                const { id, body } = payload;
                return {
                    url: `${PERCENTAGE_API}/upload/${id}`,
                    method: "PATCH",
                    body,
                };
            },
            invalidatesTags: ["Percentage"],
        }),
        updatePercentage: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${PERCENTAGE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["Percentage"],
        }),
        deletePercentage: builder.mutation({
            query: (id) => ({
                url: `${PERCENTAGE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Percentage"],
        }),
    }),
});

export const {
    useGetPercentageQuery,
    useGetPercentageByIdQuery,
    useGetPercentageItemsByIdQuery,
    useAddPercentageMutation,
    useUpdatePercentageMutation,
    useDeletePercentageMutation,

} = PercentageApi;

export default PercentageApi;
