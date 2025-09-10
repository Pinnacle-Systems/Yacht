import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SHIFT_MASTER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const shiftMasterApi = createApi({
  reducerPath: "shiftMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["shiftMaster"],
  endpoints: (builder) => ({
    getshiftMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SHIFT_MASTER_API  + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: SHIFT_MASTER_API ,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["shiftMaster"],
    }),
    getshiftMasterById: builder.query({
      query: (id) => {
        return {
          url: `${SHIFT_MASTER_API }/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["shiftMaster"],
    }),
    addshiftMaster: builder.mutation({
      query: (payload) => ({
        url: SHIFT_MASTER_API ,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["shiftMaster"],
    }),
    updateshiftMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${SHIFT_MASTER_API }/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["shiftMaster"],
    }),
    deleteshiftMaster: builder.mutation({
      query: (id) => ({
        url: `${SHIFT_MASTER_API }/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["shiftMaster"],
    }),
  }),
});

export const {
  useGetshiftMasterQuery,
  useGetshiftMasterByIdQuery,
  useAddshiftMasterMutation,
  useUpdateshiftMasterMutation,
  useDeleteshiftMasterMutation,
} = shiftMasterApi;

export default shiftMasterApi;
