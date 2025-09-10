import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EMPLOYEE_CATEGORY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const employeeCategoryApi = createApi({
  reducerPath: "employeeCategoryMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["EmployeeCategory"],
  endpoints: (builder) => ({
    getEmployeeCategory: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: EMPLOYEE_CATEGORY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: EMPLOYEE_CATEGORY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["EmployeeCategory"],
    }),
    getEmployeeCategoryById: builder.query({
      query: (id) => {
        return {
          url: `${EMPLOYEE_CATEGORY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["EmployeeCategory"],
    }),
    addEmployeeCategory: builder.mutation({
      query: (payload) => ({
        url: EMPLOYEE_CATEGORY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["EmployeeCategory"],
    }),
    updateEmployeeCategory: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${EMPLOYEE_CATEGORY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["EmployeeCategory"],
    }),
    deleteEmployeeCategory: builder.mutation({
      query: (id) => ({
        url: `${EMPLOYEE_CATEGORY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeCategory"],
    }),
  }),
});

export const {
  useGetEmployeeCategoryQuery,
  useGetEmployeeCategoryByIdQuery,
  useAddEmployeeCategoryMutation,
  useUpdateEmployeeCategoryMutation,
  useDeleteEmployeeCategoryMutation,
} = employeeCategoryApi;

export default employeeCategoryApi;
