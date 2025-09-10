import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITEM_TYPE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ItemTypeMasterApi = createApi({
    reducerPath: "itemTypeMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ItemTypeMaster"],
    endpoints: (builder) => ({
        getItemTypeMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ITEM_TYPE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ITEM_TYPE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ItemTypeMaster"],
        }),
        getItemTypeMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${ITEM_TYPE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ItemTypeMaster"],
        }),
        addItemTypeMaster: builder.mutation({
            query: (payload) => ({
                url: ITEM_TYPE_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ItemTypeMaster"],
        }),
        updateItemTypeMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${ITEM_TYPE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ItemTypeMaster"],
        }),
        deleteItemTypeMaster: builder.mutation({
            query: (id) => ({
                url: `${ITEM_TYPE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ItemTypeMaster"],
        }),
    }),
});

export const {
    useGetItemTypeMasterQuery,
    useGetItemTypeMasterByIdQuery,
    useAddItemTypeMasterMutation,
    useUpdateItemTypeMasterMutation,
    useDeleteItemTypeMasterMutation,
} = ItemTypeMasterApi;

export default ItemTypeMasterApi;
