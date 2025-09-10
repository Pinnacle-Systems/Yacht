import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EMAIL_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const EmailApi = createApi({
  reducerPath: "Email",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Email"],
  endpoints: (builder) => ({
    getEmail: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: EMAIL_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: EMAIL_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Email"],
    }),
    getEmailById: builder.query({
      query: (id) => {
        return {
          url: `${EMAIL_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Email"],
    }),
    addEmail: builder.mutation({
      query: (payload) => ({
        url: EMAIL_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Email"],
    }),
    updateEmail: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${EMAIL_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Email"],
    }),
    deleteEmail: builder.mutation({
      query: (id) => ({
        url: `${EMAIL_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Email"],
    }),
  }),
});

export const {
  useGetEmailQuery,
  useGetEmailByIdQuery,
  useAddEmailMutation,
  useUpdateEmailMutation,
  useDeleteEmailMutation,
} = EmailApi;

export default EmailApi;
