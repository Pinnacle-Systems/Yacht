import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STYLE_ITEM_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const StyleItemMasterApi = createApi({
    reducerPath: "StyleItemMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["StyleItemMaster"],
    endpoints: (builder) => ({
        getStyleItemMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: STYLE_ITEM_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: STYLE_ITEM_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["StyleItemMaster"],
        }),
        getStyleItemMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${STYLE_ITEM_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["StyleItemMaster"],
        }),
        addStyleItemMaster: builder.mutation({
            query: (payload) => ({
                url: STYLE_ITEM_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["StyleItemMaster"],
        }),
        updateStyleItemMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${STYLE_ITEM_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["StyleItemMaster"],
        }),
        deleteStyleItemMaster: builder.mutation({
            query: (id) => ({
                url: `${STYLE_ITEM_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["StyleItemMaster"],
        }),
    }),
});

export const {
    useGetStyleItemMasterQuery,
    useGetStyleItemMasterByIdQuery,
    useLazyGetStyleItemMasterByIdQuery,
    useAddStyleItemMasterMutation,
    useUpdateStyleItemMasterMutation,
    useDeleteStyleItemMasterMutation,
} = StyleItemMasterApi;

export default StyleItemMasterApi;
