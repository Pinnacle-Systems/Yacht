import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COMPANY_PAY_CODE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const companyPayCodeApi = createApi({
  reducerPath: "companyPayCode",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["companyPayCode"],
  endpoints: (builder) => ({
    getCompanyPayCode: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: COMPANY_PAY_CODE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: COMPANY_PAY_CODE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["companyPayCode"],
    }),
    getCompanyPayCodeById: builder.query({
      query: (id) => {
        return {
          url: `${COMPANY_PAY_CODE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["companyPayCode"],
    }),
    addCompanyPayCode: builder.mutation({
      query: (payload) => ({
        url: COMPANY_PAY_CODE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["companyPayCode"],
    }),
    updateCompanyPayCode: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${COMPANY_PAY_CODE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["companyPayCode"],
    }),
    deleteCompanyPayCode: builder.mutation({
      query: (id) => ({
        url: `${COMPANY_PAY_CODE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["companyPayCode"],
    }),
  }),
});

export const {
  useGetCompanyPayCodeQuery,
  useGetCompanyPayCodeByIdQuery,
  useAddCompanyPayCodeMutation,
  useUpdateCompanyPayCodeMutation,
  useDeleteCompanyPayCodeMutation,
} = companyPayCodeApi;

export default companyPayCodeApi;
