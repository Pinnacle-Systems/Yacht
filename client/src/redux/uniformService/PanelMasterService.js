import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PANEL_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PanelMasterApi = createApi({
    reducerPath: "panelMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["Party"],
    endpoints: (builder) => ({
        getPanelMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PANEL_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: PANEL_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["Party"],
        }),
        getPanelMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${PANEL_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Party"],
        }),
        addPanelMaster: builder.mutation({
            query: (payload) => ({
                url: PANEL_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Party"],
        }),
        updatePanelMaster: builder.mutation({
            query: ({ id, body }) => {
                return {
                    url: `${PANEL_API}/${id}`,
                    method: "PUT",
                    body
                };
            },
            invalidatesTags: ["Party"],
        }),
        deletePanelMaster: builder.mutation({
            query: (id) => ({
                url: `${PANEL_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Party"],
        }),
    }),
});

export const {
    useGetPanelMasterQuery,
    useGetPanelMasterByIdQuery,
    useAddPanelMasterMutation,
    useUpdatePanelMasterMutation,
    useDeletePanelMasterMutation,
} = PanelMasterApi;

export default PanelMasterApi;
