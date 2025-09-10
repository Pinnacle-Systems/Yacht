import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SAMPLE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SampleApi = createApi({
    reducerPath: "sample",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["Sample"],
    endpoints: (builder) => ({
        getSample: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SAMPLE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SAMPLE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["Sample"],
        }),



        getSampleById: builder.query({
            query: (id) => {
                return {
                    url: `${SAMPLE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Sample"],
        }),
        addSample: builder.mutation({
            query: (payload) => ({
                url: SAMPLE_API,
                method: "POST",
                body: payload,

            }),
            invalidatesTags: ["Sample"],
        }),
        updateSample: builder.mutation({
            query: (payload) => {
                const { id, body } = payload;
                return {
                    url: `${SAMPLE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["Sample"],
        }),
        updateManySample: builder.mutation({
            query: (payload) => {
                const { companyId, Samplees } = payload;
                return {
                    url: `${SAMPLE_API}/updateMany/${companyId}`,
                    method: "PUT",
                    body: Samplees,
                };
            },
            invalidatesTags: ["Sample"],
        }),

        styleImageUpload: builder.mutation({
            query: (payload) => {
                const { id, body } = payload;
                return {
                    url: `${SAMPLE_API}/styleImageUpload/${id}`,
                    method: "PATCH",
                    body,
                };
            },
            invalidatesTags: ["Sample"],
        }),
        styleImageDelete: builder.mutation({
            query: (id) => ({
                url: `${SAMPLE_API}/removeStyleImage/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Sample"],
        }),
        deleteSample: builder.mutation({
            query: (id) => ({
                url: `${SAMPLE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Sample"],
        }),
    }),
});

export const {
    useGetSampleQuery,
    useGetSampleByIdQuery,
    useAddSampleMutation,
    useUpdateSampleMutation,
    useDeleteSampleMutation,
    useUpdateManySampleMutation,
    useStyleImageUploadMutation,
    useStyleImageDeleteMutation,
} = SampleApi;

export default SampleApi;
