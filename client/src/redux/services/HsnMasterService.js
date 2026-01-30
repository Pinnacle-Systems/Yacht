import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HSN_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const HsnMasterApi = createApi({
  reducerPath: "hsnMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["HsnMaster"],
  endpoints: (builder) => ({
    getHsnMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: HSN_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: HSN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["HsnMaster"],
    }),
    getHsnMasterById: builder.query({
      query: (id) => {
        return {
          url: `${HSN_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["HsnMaster"],
    }),
    addHsnMaster: builder.mutation({
      query: (payload) => ({
        url: HSN_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["HsnMaster"],
    }),
    updateHsnMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${HSN_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["HsnMaster"],
    }),
    deleteHsnMaster: builder.mutation({
      query: (id) => ({
        url: `${HSN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["HsnMaster"],
    }),
  }),
});

export const {
  useGetHsnMasterQuery,
  useGetHsnMasterByIdQuery,
  useAddHsnMasterMutation,
  useUpdateHsnMasterMutation,
  useDeleteHsnMasterMutation,
} = HsnMasterApi;

export default HsnMasterApi;
