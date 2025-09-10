import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_BILL_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const salesBillApi = createApi({
  reducerPath: "salesBill",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["SalesBill"],
  endpoints: (builder) => ({
    getSalesBill: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: SALES_BILL_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: SALES_BILL_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["SalesBill"],
    }),
    getSalesBillById: builder.query({
      query: (id) => {
        return {
          url: `${SALES_BILL_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["SalesBill"],
    }),
    addSalesBill: builder.mutation({
      query: (payload) => ({
        url: SALES_BILL_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["SalesBill"],
    }),
    updateSalesBill: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${SALES_BILL_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["SalesBill"],
    }),
    deleteSalesBill: builder.mutation({
      query: (id) => ({
        url: `${SALES_BILL_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesBill"],
    }),
  }),
});

export const {
  useGetSalesBillQuery,
  useGetSalesBillByIdQuery,
  useAddSalesBillMutation,
  useUpdateSalesBillMutation,
  useDeleteSalesBillMutation,
} = salesBillApi;

export default salesBillApi;
