import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { USERS_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const userMasterApi = createApi({
  reducerPath: "userMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUser: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: USERS_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: USERS_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["User"],
    }),
    getUserById: builder.query({
      query: (id) => {
        return {
          url: `${USERS_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["User"],
    }),
    addUser: builder.mutation({
      query: (payload) => ({
        url: USERS_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${USERS_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `${USERS_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    sendOtp: builder.mutation({
      query: (payload) => ({
        url: `${USERS_API}/sendOtp`,
        method: "post",
        body: payload
      }),
      invalidatesTags: [],
    })
  }),
});

export const {
  useGetUserQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSendOtpMutation
} = userMasterApi;

export default userMasterApi;
