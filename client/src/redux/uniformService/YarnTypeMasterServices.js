import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { YARN_TYPE_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const YarnTypeMasterApi = createApi({
  reducerPath: "yarnTypeMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["YarnTypeMaster"],
  endpoints: (builder) => ({
    getYarnTypeMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: YARN_TYPE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: YARN_TYPE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["YarnTypeMaster"],
    }),
    getYarnTypeMasterById: builder.query({
      query: (id) => {
        return {
          url: `${YARN_TYPE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["YarnTypeMaster"],
    }),
    addYarnTypeMaster: builder.mutation({
      query: (payload) => ({
        url: YARN_TYPE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["YarnTypeMaster"],
    }),
    updateYarnTypeMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${YARN_TYPE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["YarnTypeMaster"],
    }),
    deleteYarnTypeMaster: builder.mutation({
      query: (id) => ({
        url: `${YARN_TYPE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["YarnTypeMaster"],
    }),
  }),
});

export const {
  useGetYarnTypeMasterQuery,
  useGetYarnTypeMasterByIdQuery,
  useAddYarnTypeMasterMutation,
  useUpdateYarnTypeMasterMutation,
  useDeleteYarnTypeMasterMutation,
} = YarnTypeMasterApi;

export default YarnTypeMasterApi;
