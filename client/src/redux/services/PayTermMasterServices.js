import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PAY_TERM_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PaytermMasterApi = createApi({
  reducerPath: "paytermMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["PaytermMaster"],
  endpoints: (builder) => ({
    getPaytermMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PAY_TERM_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PAY_TERM_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["PaytermMaster"],
    }),
    getPaytermMasterById: builder.query({
      query: (id) => {
        return {
          url: `${PAY_TERM_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PaytermMaster"],
    }),
    addPaytermMaster: builder.mutation({
      query: (payload) => ({
        url: PAY_TERM_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["PaytermMaster"],
    }),
    updatePaytermMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PAY_TERM_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PaytermMaster"],
    }),
    deletePaytermMaster: builder.mutation({
      query: (id) => ({
        url: `${PAY_TERM_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaytermMaster"],
    }),
  }),
});

export const {
  useGetPaytermMasterQuery,
  useGetPaytermMasterByIdQuery,
  useAddPaytermMasterMutation,
  useUpdatePaytermMasterMutation,
  useDeletePaytermMasterMutation,
} = PaytermMasterApi;

export default PaytermMasterApi;
