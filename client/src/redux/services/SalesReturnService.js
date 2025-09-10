import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_RETURN_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const salesReturnApi = createApi({
  reducerPath: "salesReturn",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["SalesReturn"],
  endpoints: (builder) => ({
    getSalesReturn: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: SALES_RETURN_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: SALES_RETURN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["SalesReturn"],
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
      providesTags: ["SalesReturn"],
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
      invalidatesTags: ["SalesReturn"],
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
      invalidatesTags: ["SalesReturn"],
    }),
    deleteSalesReturn: builder.mutation({
      query: (id) => ({
        url: `${SALES_RETURN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesReturn"],
    }),
  }),
});

export const {
  useGetSalesReturnQuery,
  useGetSalesReturnByIdQuery,
  useAddSalesReturnMutation,
  useUpdateSalesReturnMutation,
  useDeleteSalesReturnMutation,
} = salesReturnApi;

export default salesReturnApi;
