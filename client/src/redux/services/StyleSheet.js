import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STYLE_SHEET_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const styleSheetApi = createApi({
  reducerPath: "styleSheet",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["StyleSheet"],
  endpoints: (builder) => ({
    getStyleSheet: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: STYLE_SHEET_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: STYLE_SHEET_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["StyleSheet"],
    }),
    getStyleSheetById: builder.query({
      query: (id) => {
        return {
          url: `${STYLE_SHEET_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["StyleSheet"],
    }),
    addStyleSheet: builder.mutation({
      query: (payload) => ({
        url: STYLE_SHEET_API,
        method: "POST",
        body: payload,
      
      }),
      invalidatesTags: ["StyleSheet"],
    }),
    updateStyleSheet: builder.mutation({
      query:({id, body})=> {
        if(!id){
          console.log("No Id found");
          
        }
          return {
          url: `${STYLE_SHEET_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["StyleSheet"],
    }),
    deleteStyleSheet: builder.mutation({
      query: (id) => ({
        url: `${STYLE_SHEET_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StyleSheet"],
    }),
  }),
});

export const {
  useGetStyleSheetQuery,
  useGetStyleSheetByIdQuery,
  useAddStyleSheetMutation,
  useUpdateStyleSheetMutation,
  useDeleteStyleSheetMutation,
} = styleSheetApi;

export default styleSheetApi;
