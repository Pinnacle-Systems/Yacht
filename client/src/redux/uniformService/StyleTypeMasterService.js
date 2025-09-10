import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STYLE_TYPE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const StyleTypeMasterApi = createApi({
    reducerPath: "styleTypeMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["StyleTypeMaster"],
    endpoints: (builder) => ({
        getStyleTypeMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: STYLE_TYPE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: STYLE_TYPE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["StyleTypeMaster"],
        }),
        getStyleTypeMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${STYLE_TYPE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["StyleTypeMaster"],
        }),
        addStyleTypeMaster: builder.mutation({
            query: (payload) => ({
                url: STYLE_TYPE_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["StyleTypeMaster"],
        }),
        updateStyleTypeMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${STYLE_TYPE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["StyleTypeMaster"],
        }),
        deleteStyleTypeMaster: builder.mutation({
            query: (id) => ({
                url: `${STYLE_TYPE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["StyleTypeMaster"],
        }),
    }),
});

export const {
    useGetStyleTypeMasterQuery,
    useGetStyleTypeMasterByIdQuery,
    useAddStyleTypeMasterMutation,
    useUpdateStyleTypeMasterMutation,
    useDeleteStyleTypeMasterMutation,
} = StyleTypeMasterApi;

export default StyleTypeMasterApi;
