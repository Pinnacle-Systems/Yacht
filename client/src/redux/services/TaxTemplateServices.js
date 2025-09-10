import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TAX_TEMPLATE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const TaxTemplateApi = createApi({
  reducerPath: "taxTemplate",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Party"],
  endpoints: (builder) => ({
    getTaxTemplate: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: TAX_TEMPLATE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: TAX_TEMPLATE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Party"],
    }),
    getTaxTemplateById: builder.query({
      query: (id) => {
        return {
          url: `${TAX_TEMPLATE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Party"],
    }),
    addTaxTemplate: builder.mutation({
      query: (payload) => ({
        url: TAX_TEMPLATE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Party"],
    }),
    updateTaxTemplate: builder.mutation({
      query: ({id, body}) => {
        return {
          url: `${TAX_TEMPLATE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Party"],
    }),
    deleteTaxTemplate: builder.mutation({
      query: (id) => ({
        url: `${TAX_TEMPLATE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Party"],
    }),
  }),
});

export const {
  useGetTaxTemplateQuery,
  useGetTaxTemplateByIdQuery,
  useAddTaxTemplateMutation,
  useUpdateTaxTemplateMutation,
  useDeleteTaxTemplateMutation,
} = TaxTemplateApi;

export default TaxTemplateApi;
