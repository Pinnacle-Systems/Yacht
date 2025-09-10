import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FABRIC_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const FabricMasterApi = createApi({
    reducerPath: "fabricMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["Party"],
    endpoints: (builder) => ({
        getFabricMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: FABRIC_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: FABRIC_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["Party"],
        }),
        getFabricMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${FABRIC_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Party"],
        }),
        addFabricMaster: builder.mutation({
            query: (payload) => ({
                url: FABRIC_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Party"],
        }),
        updateFabricMaster: builder.mutation({
            query: ({ id, body }) => {
                return {
                    url: `${FABRIC_API}/${id}`,
                    method: "PUT",
                    body
                };
            },
            invalidatesTags: ["Party"],
        }),
        deleteFabricMaster: builder.mutation({
            query: (id) => ({
                url: `${FABRIC_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Party"],
        }),
    }),
});

export const {
    useGetFabricMasterQuery,
    useGetFabricMasterByIdQuery,
    useAddFabricMasterMutation,
    useUpdateFabricMasterMutation,
    useDeleteFabricMasterMutation,
} = FabricMasterApi;

export default FabricMasterApi;
