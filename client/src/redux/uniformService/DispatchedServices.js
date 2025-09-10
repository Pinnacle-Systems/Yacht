import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DISPATCHED_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DispatchedApi = createApi({
  reducerPath: "dispatched",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Dipatched"],
  endpoints: (builder) => ({
    getDispatched: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DISPATCHED_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: DISPATCHED_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Dipatched"],
    }),
    getDispatchedById: builder.query({
      query: ({ id, productionReceiptId }) => {
        return {
          url: `${DISPATCHED_API}/${id}/${productionReceiptId ? productionReceiptId : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Dipatched"],
    }),
    addDispatched: builder.mutation({
      query: (payload) => ({
        url: DISPATCHED_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Dipatched"],
    }),
    updateDispatched: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DISPATCHED_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Dipatched"],
    }),
    deleteDispatched: builder.mutation({
      query: (id) => ({
        url: `${DISPATCHED_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dipatched"],
    }),
  }),
});

export const {
  useGetDispatchedQuery,
  useGetDispatchedByIdQuery,
  useAddDispatchedMutation,
  useUpdateDispatchedMutation,
  useDeleteDispatchedMutation,
} = DispatchedApi;

export default DispatchedApi;
