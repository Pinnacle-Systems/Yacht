import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TAG_TYPE_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const tagTypeMasterApi = createApi({
  reducerPath: "tagTypeMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["TagType"],
  endpoints: (builder) => ({
    getTagType: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: TAG_TYPE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: TAG_TYPE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["TagType"],
    }),
    getTagTypeById: builder.query({
      query: (id) => {
        return {
          url: `${TAG_TYPE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["TagType"],
    }),
    addTagType: builder.mutation({
      query: (payload) => ({
        url: TAG_TYPE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["TagType"],
    }),
    updateTagType: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${TAG_TYPE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["TagType"],
    }),
    deleteTagType: builder.mutation({
      query: (id) => ({
        url: `${TAG_TYPE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TagType"],
    }),
  }),
});

export const {
  useGetTagTypeQuery,
  useGetTagTypeByIdQuery,
  useAddTagTypeMutation,
  useUpdateTagTypeMutation,
  useDeleteTagTypeMutation,
} = 
tagTypeMasterApi;

export default tagTypeMasterApi;
