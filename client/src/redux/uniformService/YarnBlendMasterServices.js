import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { YARN_BLEND_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const YarnBlendMasterApi = createApi({
  reducerPath: "yarnBlendMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["YarnBlendMaster"],
  endpoints: (builder) => ({
    getYarnBlendMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: YARN_BLEND_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: YARN_BLEND_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["YarnBlendMaster"],
    }),
    getYarnBlendMasterById: builder.query({
      query: (id) => {
        return {
          url: `${YARN_BLEND_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["YarnBlendMaster"],
    }),
    addYarnBlendMaster: builder.mutation({
      query: (payload) => ({
        url: YARN_BLEND_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["YarnBlendMaster"],
    }),
    updateYarnBlendMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${YARN_BLEND_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["YarnBlendMaster"],
    }),
    deleteYarnBlendMaster: builder.mutation({
      query: (id) => ({
        url: `${YARN_BLEND_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["YarnBlendMaster"],
    }),
  }),
});

export const {
  useGetYarnBlendMasterQuery,
  useGetYarnBlendMasterByIdQuery,
  useAddYarnBlendMasterMutation,
  useUpdateYarnBlendMasterMutation,
  useDeleteYarnBlendMasterMutation,
} = YarnBlendMasterApi;

export default YarnBlendMasterApi;
