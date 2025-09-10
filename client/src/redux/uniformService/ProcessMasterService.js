import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PROCESS_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProcessApi = createApi({
    reducerPath: "process",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["Process"],
    endpoints: (builder) => ({
        getProcessMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PROCESS_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: PROCESS_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["Process"],
        }),
        getProcessMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${PROCESS_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Process"],
        }),
        addProcessMaster: builder.mutation({
            query: (payload) => ({
                url: PROCESS_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["Process"],
        }),
        updateProcessMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${PROCESS_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["Process"],
        }),
        deleteProcessMaster: builder.mutation({
            query: (id) => ({
                url: `${PROCESS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Process"],
        }),
    }),
});

export const {
    useGetProcessMasterQuery,
    useGetProcessMasterByIdQuery,
    useAddProcessMasterMutation,
    useUpdateProcessMasterMutation,
    useDeleteProcessMasterMutation,
} = ProcessApi;

export default ProcessApi;
