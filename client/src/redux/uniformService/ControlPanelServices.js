import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CONTROL_PANEL_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const countryMasterApi = createApi({
  reducerPath: "controlPanel",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["controlPanel"],
  endpoints: (builder) => ({
    getcontrolPanel: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: CONTROL_PANEL_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: CONTROL_PANEL_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Countries"],
    }),
    getcontrolPanelById: builder.query({
      query: (id) => {
        return {
          url: `${CONTROL_PANEL_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Countries"],
    }),
    addcontrolPanel: builder.mutation({
      query: (payload) => ({
        url: CONTROL_PANEL_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Countries"],
    }),
    updatecontrolPanel: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${CONTROL_PANEL_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Countries"],
    }),
    deletecontrolPanel: builder.mutation({
      query: (id) => ({
        url: `${CONTROL_PANEL_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Countries"],
    }),
  }),
});

export const {
  useGetcontrolPanelQuery,
  useGetcontrolPanelByIdQuery,
  useAddcontrolPanelMutation,
  useUpdatecontrolPanelMutation,
  useDeletecontrolPanelMutation,
} = countryMasterApi;
export default countryMasterApi;
