import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SIZE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SizeMasterApi = createApi({
    reducerPath: "sizeMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["SizeMaster"],
    endpoints: (builder) => ({
        getSizeMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SIZE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SIZE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["SizeMaster"],
        }),
        getSizeMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${SIZE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["SizeMaster"],
        }),
        addSizeMaster: builder.mutation({
            query: (payload) => ({
                url: SIZE_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["SizeMaster"],
        }),
        updateSizeMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${SIZE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["SizeMaster"],
        }),
        deleteSizeMaster: builder.mutation({
            query: (id) => ({
                url: `${SIZE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["SizeMaster"],
        }),
    }),
});

export const {
    useGetSizeMasterQuery,
    useGetSizeMasterByIdQuery,
    useAddSizeMasterMutation,
    useUpdateSizeMasterMutation,
    useDeleteSizeMasterMutation,
} = SizeMasterApi;

export default SizeMasterApi;
