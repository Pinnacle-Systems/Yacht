import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { QUOTES_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const quotesApi = createApi({
  reducerPath: "quotes",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Quotes"],
  endpoints: (builder) => ({
    getQuotes: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: QUOTES_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: QUOTES_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Quotes"],
    }),
    getQuotesById: builder.query({
      query: (id) => {
        return {
          url: `${QUOTES_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Quotes"],
    }),
    addQuotes: builder.mutation({
      query: (payload) => ({
        url: QUOTES_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Quotes"],
    }),
    updateQuotes: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${QUOTES_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Quotes"],
    }),
    deleteQuotes: builder.mutation({
      query: (id) => ({
        url: `${QUOTES_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quotes"],
    }),
  }),
});

export const {
  useGetQuotesQuery,
  useGetQuotesByIdQuery,
  useAddQuotesMutation,
  useUpdateQuotesMutation,
  useDeleteQuotesMutation,
} = quotesApi;

export default quotesApi;
