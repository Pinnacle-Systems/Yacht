

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UOM_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const uomMasterApi = createApi({
    reducerPath: "uomMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["Uom"],
    endpoints: (builder) => ({
        getUom: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: UOM_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: UOM_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["Uom"],
        }),
        getUomById: builder.query({
            query: (id) => {
                return {
                    url: `${UOM_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Uom"],
        }),
        addUom: builder.mutation({
            query: (payload) => ({
                url: UOM_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["Uom"],
        }),
        updateUom: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${UOM_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["Uom"],
        }),
        deleteUom: builder.mutation({
            query: (id) => ({
                url: `${UOM_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Uom"],
        }),
    }),
});

export const {
    useGetUomQuery,
    useGetUomByIdQuery,
    useAddUomMutation,
    useUpdateUomMutation,
    useDeleteUomMutation,
} = uomMasterApi;

export default uomMasterApi;

