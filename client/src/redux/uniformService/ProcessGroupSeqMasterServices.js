import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PROCESS_GROUP_SEQ_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProcessGroupSeqApi = createApi({
    reducerPath: "processGroupSeq",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ProcessGroupSeq"],
    endpoints: (builder) => ({
        getProcessGroupSeqMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PROCESS_GROUP_SEQ_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: PROCESS_GROUP_SEQ_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ProcessGroupSeq"],
        }),
        getProcessGroupSeqMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${PROCESS_GROUP_SEQ_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ProcessGroupSeq"],
        }),
        addProcessGroupSeqMaster: builder.mutation({
            query: (payload) => ({
                url: PROCESS_GROUP_SEQ_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ProcessGroupSeq"],
        }),
        updateProcessGroupSeqMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${PROCESS_GROUP_SEQ_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ProcessGroupSeq"],
        }),
        deleteProcessGroupSeqMaster: builder.mutation({
            query: (id) => ({
                url: `${PROCESS_GROUP_SEQ_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ProcessGroupSeq"],
        }),
    }),
});

export const {
    useGetProcessGroupSeqMasterQuery,
    useGetProcessGroupSeqMasterByIdQuery,
    useAddProcessGroupSeqMasterMutation,
    useUpdateProcessGroupSeqMasterMutation,
    useDeleteProcessGroupSeqMasterMutation,
} = ProcessGroupSeqApi;

export default ProcessGroupSeqApi;
