import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PAGES_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const pageDetailsApi = createApi({
  reducerPath: "pageMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Pages"],
  endpoints: (builder) => ({
    getPages: builder.query({
      query: ({searchParams}) => {
        if(searchParams){
          return {
            url: PAGES_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          };
        }
        return {
          url: PAGES_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Pages"],
    }),
    getPagesById: builder.query({
      query: (id) => {
        return {
          url: `${PAGES_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Pages"],
    }),
    addPage: builder.mutation({
      query: (payload) => ({
        url: PAGES_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Pages"],
    }),
    updatePage: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PAGES_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Pages"],
    }),
    deletePage: builder.mutation({
      query: (id) => ({
        url: `${PAGES_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pages"],
    }),
    getPagePermissionsById: builder.query({
      query: ({currentPageId, userRoleId}) => {
        return {
          url: `${PAGES_API}/getPermissions/${currentPageId}/${userRoleId}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Pages"],
    })
  }),
  
});

export const {
  useGetPagesQuery,
  useGetPagesByIdQuery,
  useGetPagePermissionsByIdQuery,
  useAddPageMutation,
  useUpdatePageMutation,
  useDeletePageMutation
} = pageDetailsApi;

export default pageDetailsApi;
