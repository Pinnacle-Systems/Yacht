import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COLOR_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ColorMasterApi = createApi({
    reducerPath: "colorMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ColorMaster"],
    endpoints: (builder) => ({
        getColorMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: COLOR_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: COLOR_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ColorMaster"],
        }),
        getColorMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${COLOR_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ColorMaster"],
        }),
        addColorMaster: builder.mutation({
            query: (payload) => ({
                url: COLOR_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ColorMaster"],
        }),
        updateColorMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${COLOR_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ColorMaster"],
        }),
        deleteColorMaster: builder.mutation({
            query: (id) => ({
                url: `${COLOR_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ColorMaster"],
        }),
    }),
});

export const {
    useGetColorMasterQuery,
    useGetColorMasterByIdQuery,
    useAddColorMasterMutation,
    useUpdateColorMasterMutation,
    useDeleteColorMasterMutation,
} = ColorMasterApi;

export default ColorMasterApi;
