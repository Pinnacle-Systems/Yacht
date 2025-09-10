import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STATE_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const stateMasterApi = createApi({
  reducerPath: "stateMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["State"],
  endpoints: (builder) => ({
    getState: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: STATE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: STATE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["State"],
    }),
    getStateById: builder.query({
      query: (id) => {
        return {
          url: `${STATE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["State"],
    }),
    addState: builder.mutation({
      query: (payload) => ({
        url: STATE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["State"],
    }),
    updateState: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${STATE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["State"],
    }),
    deleteState: builder.mutation({
      query: (id) => ({
        url: `${STATE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["State"],
    }),
  }),
});

export const {
  useGetStateQuery,
  useGetStateByIdQuery,
  useLazyGetStateByIdQuery,
  useAddStateMutation,
  useUpdateStateMutation,
  useDeleteStateMutation,
} = stateMasterApi;

export default stateMasterApi;
