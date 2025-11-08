import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_RETURN_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SalesReturnApi = createApi({
  reducerPath: "salesReturn",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["salesReturn"],
  endpoints: (builder) => ({
    getSalesReturn: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SALES_RETURN_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: SALES_RETURN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["salesReturn"],
    }),
    getSalesReturnById: builder.query({
      query: (id) => {
        return {
          url: `${SALES_RETURN_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["salesReturn"],
    }),
    addSalesReturn: builder.mutation({
      query: (payload) => ({
        url: SALES_RETURN_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["salesReturn"],
    }),
    updateSalesReturn: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${SALES_RETURN_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["salesReturn"],
    }),
    deleteSalesReturn: builder.mutation({
      query: (id) => ({
        url: `${SALES_RETURN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["salesReturn"],
    }),
    getSalesReturnReport: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SALES_RETURN_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: `${SALES_RETURN_API}/salesReturnReport`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["salesReturn"],
    }),
  }),
});

export const {
  useGetSalesReturnQuery,
  useGetSalesReturnByIdQuery,
  useAddSalesReturnMutation,
  useUpdateSalesReturnMutation,
  useDeleteSalesReturnMutation,
  useGetSalesReturnReportQuery
} = SalesReturnApi;

export default SalesReturnApi;
