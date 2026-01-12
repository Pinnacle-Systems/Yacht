import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PORTION_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PortionMasterApi = createApi({
    reducerPath: "portionMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["PortionMaster"],
    endpoints: (builder) => ({
        getPortionMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PORTION_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: PORTION_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["PortionMaster"],
        }),
        getPortionMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${PORTION_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["PortionMaster"],
        }),
        addPortionMaster: builder.mutation({
            query: (payload) => ({
                url: PORTION_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["PortionMaster"],
        }),
        updatePortionMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${PORTION_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["PortionMaster"],
        }),
        deletePortionMaster: builder.mutation({
            query: (id) => ({
                url: `${PORTION_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PortionMaster"],
        }),
    }),
});

export const {
    useGetPortionMasterQuery,
    useGetPortionMasterByIdQuery,
    useLazyGetPortionMasterByIdQuery,
    useAddPortionMasterMutation,
    useUpdatePortionMasterMutation,
    useDeletePortionMasterMutation,
} = PortionMasterApi;

export default PortionMasterApi;
