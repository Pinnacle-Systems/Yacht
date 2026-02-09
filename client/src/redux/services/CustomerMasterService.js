import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CUSTOMER_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const customerMasterApi = createApi({
  reducerPath: "customerMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    getCustomer: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: CUSTOMER_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: CUSTOMER_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Customer"],
    }),
    getCustomerById: builder.query({
      query: (id) => {
        return {
          url: `${CUSTOMER_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Customer"],
    }),
    addCustomer: builder.mutation({
      query: (payload) => ({
        url: CUSTOMER_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Customer"],
    }),
    updateCustomer: builder.mutation({
      query: ({id, body}) => {
        return {
          url: `${CUSTOMER_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Customer"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `${CUSTOMER_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useGetCustomerQuery,
  useGetCustomerByIdQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerMasterApi;

export default customerMasterApi;
