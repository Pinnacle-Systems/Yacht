import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_RETURN_SHOWROOM_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SalesReturnSRApi = createApi({
  reducerPath: "salesReturnSR",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["salesReturnSR"],
  endpoints: (builder) => ({
    getSalesReturnSR: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SALES_RETURN_SHOWROOM_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: SALES_RETURN_SHOWROOM_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["salesReturnSR"],
    }),
    getSalesReturnSRById: builder.query({
      query: (id) => {
        return {
          url: `${SALES_RETURN_SHOWROOM_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["salesReturnSR"],
    }),
    addSalesReturnSR: builder.mutation({
      query: (payload) => ({
        url: SALES_RETURN_SHOWROOM_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["salesReturnSR"],
    }),
    updateSalesReturnSR: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${SALES_RETURN_SHOWROOM_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["salesReturnSR"],
    }),
    deleteSalesReturnSR: builder.mutation({
      query: (id) => ({
        url: `${SALES_RETURN_SHOWROOM_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["salesReturnSR"],
    }),
  }),
});

export const {
  useGetSalesReturnSRQuery,
  useGetSalesReturnSRByIdQuery,
  useGetSalesReturnSRReportQuery,
  useAddSalesReturnSRMutation,
  useUpdateSalesReturnSRMutation,
  useDeleteSalesReturnSRMutation,
} = SalesReturnSRApi;

export default SalesReturnSRApi;
