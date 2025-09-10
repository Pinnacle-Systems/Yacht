import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LOOPLENGTH_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const LoopLengthApi = createApi({
  reducerPath: "loopLength",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["LoopLength"],
  endpoints: (builder) => ({
    getLoopLength: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: LOOPLENGTH_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: LOOPLENGTH_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["LoopLength"],
    }),
    getLoopLengthById: builder.query({
      query: (id) => {
        return {
          url: `${LOOPLENGTH_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LoopLength"],
    }),
    addLoopLength: builder.mutation({
      query: (payload) => ({
        url: LOOPLENGTH_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["LoopLength"],
    }),
    updateLoopLength: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${LOOPLENGTH_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LoopLength"],
    }),
    deleteLoopLength: builder.mutation({
      query: (id) => ({
        url: `${LOOPLENGTH_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LoopLength"],
    }),
  }),
});

export const {
  useGetLoopLengthQuery,
  useGetLoopLengthByIdQuery,
  useAddLoopLengthMutation,
  useUpdateLoopLengthMutation,
  useDeleteLoopLengthMutation,
} = LoopLengthApi;

export default LoopLengthApi;
