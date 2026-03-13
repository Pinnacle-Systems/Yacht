import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { REFERENCE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ReferenceMasterApi = createApi({
    reducerPath: "referenceMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ReferenceMaster"],
    endpoints: (builder) => ({
        getReferenceMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: REFERENCE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: REFERENCE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ReferenceMaster"],
        }),
        getReferenceMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${REFERENCE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ReferenceMaster"],
        }),
        addReferenceMaster: builder.mutation({
            query: (payload) => ({
                url: REFERENCE_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ReferenceMaster"],
        }),
        updateReferenceMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${REFERENCE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ReferenceMaster"],
        }),
        deleteReferenceMaster: builder.mutation({
            query: (id) => ({
                url: `${REFERENCE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ReferenceMaster"],
        }),
    }),
});

export const {
    useGetReferenceMasterQuery,
    useGetReferenceMasterByIdQuery,
    useLazyGetReferenceMasterByIdQuery,
    useAddReferenceMasterMutation,
    useUpdateReferenceMasterMutation,
    useDeleteReferenceMasterMutation,
} = ReferenceMasterApi;

export default ReferenceMasterApi;
