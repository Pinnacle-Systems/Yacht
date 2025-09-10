import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GSM_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const GsmApi = createApi({
  reducerPath: "gsm",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["gsm"],
  endpoints: (builder) => ({
    getgsm: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: GSM_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: GSM_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["gsm"],
    }),
    getgsmById: builder.query({
      query: (id) => {
        return {
          url: `${GSM_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["gsm"],
    }),
    addgsm: builder.mutation({
      query: (payload) => ({
        url: GSM_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["gsm"],
    }),
    updategsm: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${GSM_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["gsm"],
    }),
    deletegsm: builder.mutation({
      query: (id) => ({
        url: `${GSM_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["gsm"],
    }),
  }),
});

export const {
  useGetgsmQuery,
  useGetgsmByIdQuery,
  useAddgsmMutation,
  useUpdategsmMutation,
  useDeletegsmMutation,
} = GsmApi;

export default GsmApi;
