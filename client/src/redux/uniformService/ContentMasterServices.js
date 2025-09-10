import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CONTENT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ContentMasterApi = createApi({
  reducerPath: "contentMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ContentMaster"],
  endpoints: (builder) => ({
    getContentMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: CONTENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: CONTENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["ContentMaster"],
    }),
    getContentMasterById: builder.query({
      query: (id) => {
        return {
          url: `${CONTENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["ContentMaster"],
    }),
    addContentMaster: builder.mutation({
      query: (payload) => ({
        url: CONTENT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["ContentMaster"],
    }),
    updateContentMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${CONTENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ContentMaster"],
    }),
    deleteContentMaster: builder.mutation({
      query: (id) => ({
        url: `${CONTENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContentMaster"],
    }),
  }),
});

export const {
  useGetContentMasterQuery,
  useGetContentMasterByIdQuery,
  useAddContentMasterMutation,
  useUpdateContentMasterMutation,
  useDeleteContentMasterMutation,
} = ContentMasterApi;

export default ContentMasterApi;
