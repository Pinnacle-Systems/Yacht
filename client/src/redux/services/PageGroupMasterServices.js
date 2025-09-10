import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PAGES_GROUP_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PageGroupMasterApi = createApi({
  reducerPath: "pageGroupMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["PageGroup"],
  endpoints: (builder) => ({
    getPageGroup: builder.query({
      query: ({searchParams}) => {
        if(searchParams){
          return {
            url: PAGES_GROUP_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          };
        }
        return {
          url: PAGES_GROUP_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PageGroup"],
    }),
    getPageGroupById: builder.query({
      query: (id) => {
        return {
          url: `${PAGES_GROUP_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PageGroup"],
    }),
    addPageGroup: builder.mutation({
      query: (payload) => ({
        url: PAGES_GROUP_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["PageGroup"],
    }),
    updatePageGroup: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PAGES_GROUP_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PageGroup"],
    }),
    deletePageGroup: builder.mutation({
      query: (id) => ({
        url: `${PAGES_GROUP_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PageGroup"],
    }),
    getPageGroupPermissionsById: builder.query({
      query: ({currentPageId, userRoleId}) => {
        return {
          url: `${PAGES_GROUP_API}/getPermissions/${currentPageId}/${userRoleId}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PageGroup"],
    })
  }),
  
});

export const {
  useGetPageGroupQuery,
  useGetPageGroupByIdQuery,
  useGetPageGroupPermissionsByIdQuery,
  useAddPageGroupMutation,
  useUpdatePageGroupMutation,
  useDeletePageGroupMutation
} = PageGroupMasterApi;

export default PageGroupMasterApi;
