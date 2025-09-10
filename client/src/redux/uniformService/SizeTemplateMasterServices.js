import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SIZE_TEMPLATE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const sizeTemplateApi = createApi({
  reducerPath: "SizeTemplate",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["SizeTemplate"],
  endpoints: (builder) => ({
    getSizeTemplate: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SIZE_TEMPLATE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: SIZE_TEMPLATE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["SizeTemplate"],
    }),
    getSizeTemplateById: builder.query({
      query: (id) => {
        return {
          url: `${SIZE_TEMPLATE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["SizeTemplate"],
    }),
    addSizeTemplate: builder.mutation({
      query: (payload) => ({
        url: SIZE_TEMPLATE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["SizeTemplate"],
    }),
    updateSizeTemplate: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${SIZE_TEMPLATE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["SizeTemplate"],
    }),
    deleteSizeTemplate: builder.mutation({
      query: (id) => ({
        url: `${SIZE_TEMPLATE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SizeTemplate"],
    }),
  }),
});

export const {
  useGetSizeTemplateQuery,
  useGetSizeTemplateByIdQuery,
  useAddSizeTemplateMutation,
  useUpdateSizeTemplateMutation,
  useDeleteSizeTemplateMutation
} = sizeTemplateApi

export default sizeTemplateApi;
