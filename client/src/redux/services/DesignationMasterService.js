import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DESIGNATION_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const designationMasterApi = createApi({
  reducerPath: "designationMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["designation"],
  endpoints: (builder) => ({
    getdesignation: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DESIGNATION_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: DESIGNATION_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["designation"],
    }),
    getdesignationById: builder.query({
      query: (id) => {
        return {
          url: `${DESIGNATION_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["designation"],
    }),
    adddesignation: builder.mutation({
      query: (payload) => ({
        url: DESIGNATION_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["designation"],
    }),
    updatedesignation: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DESIGNATION_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["designation"],
    }),
    deletedesignation: builder.mutation({
      query: (id) => ({
        url: `${DESIGNATION_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["designation"],
    }),
  }),
});

export const {
  useGetdesignationQuery,
  useGetdesignationByIdQuery,
  useAdddesignationMutation,
  useUpdatedesignationMutation,
  useDeletedesignationMutation,
} = designationMasterApi;

export default designationMasterApi;
