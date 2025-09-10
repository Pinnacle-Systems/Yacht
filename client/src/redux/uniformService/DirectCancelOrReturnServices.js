import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DIRECT_CANCEL_OR_RETURN_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DirectCancelOrReturnApi = createApi({
    reducerPath: "directCancelOrReturn",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["DirectCancelOrReturn"],
    endpoints: (builder) => ({
        getDirectCancelOrReturn: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: DIRECT_CANCEL_OR_RETURN_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: DIRECT_CANCEL_OR_RETURN_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["DirectCancelOrReturn"],
        }),
        getDirectCancelOrReturnById: builder.query({
            query: (id) => {
                return {
                    url: `${DIRECT_CANCEL_OR_RETURN_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["DirectCancelOrReturn"],
        }),
        getDirectItems: builder.query({
            query: ({ params }) => {
                return {
                    url: `${DIRECT_CANCEL_OR_RETURN_API}/getDirectItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["DirectCancelOrReturn"],
        }),
        getPoItemsandDirectInwardItems: builder.query({
            query: ({ params }) => {
                return {
                    url: `${DIRECT_CANCEL_OR_RETURN_API}/getPoItemsandDirectInwardItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["DirectCancelOrReturn"],
        }),
        getDirectItemById: builder.query({
            query: ({ id, billEntryId }) => {
                return {
                    url: `${DIRECT_CANCEL_OR_RETURN_API}/getDirectItems/${id}/${billEntryId ? billEntryId : null}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["DirectCancelOrReturn"],
        }),

        addDirectCancelOrReturn: builder.mutation({
            query: (payload) => ({
                url: DIRECT_CANCEL_OR_RETURN_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["DirectCancelOrReturn"],
        }),
        updateDirectCancelOrReturn: builder.mutation({
            query: ({ id, ...body }) => {
                return {
                    url: `${DIRECT_CANCEL_OR_RETURN_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["DirectCancelOrReturn"],
        }),
        deleteDirectCancelOrReturn: builder.mutation({
            query: (id) => ({
                url: `${DIRECT_CANCEL_OR_RETURN_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["DirectCancelOrReturn"],
        }),
    }),
});

export const {
    useGetDirectCancelOrReturnQuery,
    useGetDirectCancelOrReturnByIdQuery,
    useGetPoItemsandDirectInwardItemsQuery,
    useGetDirectItemsQuery,
    useGetDirectItemByIdQuery,
    useAddDirectCancelOrReturnMutation,
    useUpdateDirectCancelOrReturnMutation,
    useDeleteDirectCancelOrReturnMutation,
} = DirectCancelOrReturnApi;

export default DirectCancelOrReturnApi;
