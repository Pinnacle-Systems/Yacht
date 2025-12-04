import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STYLE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const StyleMasterApi = createApi({
  reducerPath: "styleMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["StyleMaster"],
  endpoints: (builder) => ({
    getStyleMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: STYLE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: STYLE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["StyleMaster"],
    }),
    getStyleMasterById: builder.query({
      query: (id) => {
        return {
          url: `${STYLE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["StyleMaster"],
    }),
    addStyleMaster: builder.mutation({
      query: (payload) => ({
        url: STYLE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["StyleMaster"],
    }),
    upload: builder.mutation({
      query: (payload) => {
        const { id, body } = payload;
        return {
          url: `${STYLE_API}/upload/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["StyleMaster"],
    }),
    updateStyleMaster: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${STYLE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["StyleMaster"],
    }),
    deleteStyleMaster: builder.mutation({
      query: (id) => ({
        url: `${STYLE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StyleMaster"],
    }),
    getStyleCodeDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${STYLE_API}/styleCode`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["StyleMaster"],
    }),
  }),
});

export const {
  useGetStyleMasterQuery,
  useGetStyleMasterByIdQuery,
  useLazyGetStyleMasterByIdQuery,
  useAddStyleMasterMutation,
  useUpdateStyleMasterMutation,
  useDeleteStyleMasterMutation,
  useUploadMutation,
  useLazyGetStyleCodeDetailQuery,
} = StyleMasterApi;

export default StyleMasterApi;
