import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {EMPLOYEE_SUB_CATEGORY_API} from '../../Api'

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const employeesubCategoryApi = createApi({
  reducerPath: "employeeSubCategory",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["employeeSubCategory"],
  endpoints: (builder) => ({
    getemployeeSubCategory: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: EMPLOYEE_SUB_CATEGORY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: EMPLOYEE_SUB_CATEGORY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["employeeSubCategory"],
    }),
    getemployeeSubCategoryById: builder.query({
      query: (id) => {
        return {
          url: `${EMPLOYEE_SUB_CATEGORY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["employeeSubCategory"],
    }),
    addemployeeSubCategory: builder.mutation({
      query: (payload) => ({
        url: EMPLOYEE_SUB_CATEGORY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["employeeSubCategory"],
    }),
    updateemployeeSubCategory: builder.mutation({
      query: ({id, body}) => {
        return {
          url: `${EMPLOYEE_SUB_CATEGORY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["employeeSubCategory"],
    }),
    deleteemployeeSubCategory: builder.mutation({
      query: (id) => ({
        url: `${EMPLOYEE_SUB_CATEGORY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["employeeSubCategory"],
    }),
  }),
});

export const {
  useGetemployeeSubCategoryQuery,
  useGetemployeeSubCategoryByIdQuery,
  useAddemployeeSubCategoryMutation,
  useUpdateemployeeSubCategoryMutation,
  useDeleteemployeeSubCategoryMutation,
} = employeesubCategoryApi;

export default employeesubCategoryApi;
