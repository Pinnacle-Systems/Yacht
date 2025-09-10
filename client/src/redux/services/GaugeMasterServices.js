import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GUAGE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const GaugeApi = createApi({
  reducerPath: "gauge",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Gauge"],
  endpoints: (builder) => ({
    getGauge: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: GUAGE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: GUAGE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Gauge"],
    }),
    getGaugeById: builder.query({
      query: (id) => {
        return {
          url: `${GUAGE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Gauge"],
    }),
    addGauge: builder.mutation({
      query: (payload) => ({
        url: GUAGE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Gauge"],
    }),
    updateGauge: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${GUAGE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Gauge"],
    }),
    deleteGauge: builder.mutation({
      query: (id) => ({
        url: `${GUAGE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Gauge"],
    }),
  }),
});

export const {
  useGetGaugeQuery,
  useGetGaugeByIdQuery,
  useAddGaugeMutation,
  useUpdateGaugeMutation,
  useDeleteGaugeMutation,
} = GaugeApi;

export default GaugeApi;
