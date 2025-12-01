import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PROCESS_GROUP_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProcessGroupApi = createApi({
    reducerPath: "processGroup",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ProcessGroup"],
    endpoints: (builder) => ({
        getProcessGroupMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PROCESS_GROUP_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: PROCESS_GROUP_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ProcessGroup"],
        }),
        getProcessGroupMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${PROCESS_GROUP_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ProcessGroup"],
        }),
        addProcessGroupMaster: builder.mutation({
            query: (payload) => ({
                url: PROCESS_GROUP_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ProcessGroup"],
        }),
        updateProcessGroupMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${PROCESS_GROUP_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ProcessGroup"],
        }),
        deleteProcessGroupMaster: builder.mutation({
            query: (id) => ({
                url: `${PROCESS_GROUP_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ProcessGroup"],
        }),
    }),
});

export const {
    useGetProcessGroupMasterQuery,
    useGetProcessGroupMasterByIdQuery,
    useLazyGetProcessGroupMasterByIdQuery,
    useAddProcessGroupMasterMutation,
    useUpdateProcessGroupMasterMutation,
    useDeleteProcessGroupMasterMutation,
} = ProcessGroupApi;

export default ProcessGroupApi;
