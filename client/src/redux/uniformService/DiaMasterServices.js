import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DIA_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DiaApi = createApi({
  reducerPath: "dia",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Dia"],
  endpoints: (builder) => ({
    getDia: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DIA_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: DIA_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Dia"],
    }),
    getDiaById: builder.query({
      query: (id) => {
        return {
          url: `${DIA_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Dia"],
    }),
    addDia: builder.mutation({
      query: (payload) => ({
        url: DIA_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Dia"],
    }),
    updateDia: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DIA_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Dia"],
    }),
    deleteDia: builder.mutation({
      query: (id) => ({
        url: `${DIA_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dia"],
    }),
  }),
});

export const {
  useGetDiaQuery,
  useGetDiaByIdQuery,
  useAddDiaMutation,
  useUpdateDiaMutation,
  useDeleteDiaMutation,
} = DiaApi;

export default DiaApi;
