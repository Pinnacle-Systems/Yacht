import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CURRENCY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const CurrencyMasterApi = createApi({
  reducerPath: "currencyMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["CurrencyMaster"],
  endpoints: (builder) => ({
    getCurrencyMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: CURRENCY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: CURRENCY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["CurrencyMaster"],
    }),
    getCurrencyMasterById: builder.query({
      query: (id) => {
        return {
          url: `${CURRENCY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["CurrencyMaster"],
    }),
    addCurrencyMaster: builder.mutation({
      query: (payload) => ({
        url: CURRENCY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["CurrencyMaster"],
    }),
    updateCurrencyMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${CURRENCY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["CurrencyMaster"],
    }),
    deleteCurrencyMaster: builder.mutation({
      query: (id) => ({
        url: `${CURRENCY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CurrencyMaster"],
    }),
  }),
});

export const {
  useGetCurrencyMasterQuery,
  useGetCurrencyMasterByIdQuery,
  useAddCurrencyMasterMutation,
  useUpdateCurrencyMasterMutation,
  useDeleteCurrencyMasterMutation,
} = CurrencyMasterApi;

export default CurrencyMasterApi;
