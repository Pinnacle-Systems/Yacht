import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PARTY_CATEGORY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const partyCategoryMasterApi = createApi({
  reducerPath: "partyCategoryMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["PartyCategoryMaster"],
  endpoints: (builder) => ({
    getPartyCategoryMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PARTY_CATEGORY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PARTY_CATEGORY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["PartyCategoryMaster"],
    }),
    getPartyCategoryMasterById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_CATEGORY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PartyCategoryMaster"],
    }),
    addPartyCategoryMaster: builder.mutation({
      query: (payload) => ({
        url: PARTY_CATEGORY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["PartyCategoryMaster"],
    }),
    updatePartyCategoryMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PARTY_CATEGORY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PartyCategoryMaster"],
    }),
    deletePartyCategoryMaster: builder.mutation({
      query: (id) => ({
        url: `${PARTY_CATEGORY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PartyCategoryMaster"],
    }),
  }),
});

export const {
  useGetPartyCategoryMasterQuery,
  useGetPartyCategoryMasterByIdQuery,
  useAddPartyCategoryMasterMutation,
  useUpdatePartyCategoryMasterMutation,
  useDeletePartyCategoryMasterMutation,
} = partyCategoryMasterApi;

export default partyCategoryMasterApi;
