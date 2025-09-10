import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CLASS_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ClassMasterApi = createApi({
    reducerPath: "classMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ClassMaster"],
    endpoints: (builder) => ({
        getClassMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: CLASS_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: CLASS_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ClassMaster"],
        }),
        getClassMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${CLASS_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ClassMaster"],
        }),
        addClassMaster: builder.mutation({
            query: (payload) => ({
                url: CLASS_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ClassMaster"],
        }),
        updateClassMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${CLASS_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ClassMaster"],
        }),
        deleteClassMaster: builder.mutation({
            query: (id) => ({
                url: `${CLASS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ClassMaster"],
        }),
    }),
});

export const {
    useGetClassMasterQuery,
    useGetClassMasterByIdQuery,
    useAddClassMasterMutation,
    useUpdateClassMasterMutation,
    useDeleteClassMasterMutation,
} = ClassMasterApi;

export default ClassMasterApi;
