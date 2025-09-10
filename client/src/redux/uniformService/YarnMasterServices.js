import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { YARN_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const YarnMasterApi = createApi({
  reducerPath: "yarnMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Party"],
  endpoints: (builder) => ({
    getYarnMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: YARN_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: YARN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Party"],
    }),
    getYarnMasterById: builder.query({
      query: (id) => {
        return {
          url: `${YARN_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Party"],
    }),
    addYarnMaster: builder.mutation({
      query: (payload) => ({
        url: YARN_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Party"],
    }),
    updateYarnMaster: builder.mutation({
      query: ({id, body}) => {
        return {
          url: `${YARN_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Party"],
    }),
    deleteYarnMaster: builder.mutation({
      query: (id) => ({
        url: `${YARN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Party"],
    }),
  }),
});

export const {
  useGetYarnMasterQuery,
  useGetYarnMasterByIdQuery,
  useAddYarnMasterMutation,
  useUpdateYarnMasterMutation,
  useDeleteYarnMasterMutation,
} = YarnMasterApi;

export default YarnMasterApi;
