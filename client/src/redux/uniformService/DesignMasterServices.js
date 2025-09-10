import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DESIGN_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const DesignApi = createApi({
  reducerPath: "design",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["design"],
  endpoints: (builder) => ({
    getdesign: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DESIGN_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: DESIGN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["design"],
    }),
    getdesignById: builder.query({
      query: (id) => {
        return {
          url: `${DESIGN_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["design"],
    }),
    adddesign: builder.mutation({
      query: (payload) => ({
        url: DESIGN_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["design"],
    }),
    updatedesign: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DESIGN_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["design"],
    }),
    deletedesign: builder.mutation({
      query: (id) => ({
        url: `${DESIGN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["design"],
    }),
  }),
});

export const {
  useGetdesignQuery,
  useGetdesignByIdQuery,
  useAdddesignMutation,
  useUpdatedesignMutation,
  useDeletedesignMutation,
} = DesignApi;

export default DesignApi;
