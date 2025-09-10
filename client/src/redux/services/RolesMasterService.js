import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ROLES_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const roleMasterApi = createApi({
  reducerPath: "roleMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Roles"],
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: ROLES_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ROLES_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Roles"],
    }),
    getRoleById: builder.query({
      query: (id) => {
        return {
          url: `${ROLES_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Roles"],
    }),
    addRole: builder.mutation({
      query: (payload) => ({
        url: ROLES_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Roles"],
    }),
    updateRole: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${ROLES_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Roles"],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `${ROLES_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleMasterApi;

export default roleMasterApi;
