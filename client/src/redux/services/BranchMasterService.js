import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BRANCHES_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const branchMasterApi = createApi({
  reducerPath: "branchMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Branch"],
  endpoints: (builder) => ({
    getBranch: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: BRANCHES_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: BRANCHES_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Branch"],
    }),
    getBranchById: builder.query({
      query: (id) => {
        return {
          url: `${BRANCHES_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Branch"],
    }),
    addBranch: builder.mutation({
      query: (payload) => ({
        url: BRANCHES_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Branch"],
    }),
    updateBranch: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${BRANCHES_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Branch"],
    }),
    updateManyBranch: builder.mutation({
      query: (payload) => {
        const { companyId, branches } = payload;
        return {
          url: `${BRANCHES_API}/updateMany/${companyId}`,
          method: "PUT",
          body: branches,
        };
      },
      invalidatesTags: ["Branch"],
    }),
    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `${BRANCHES_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Branch"],
    }),
  }),
});

export const {
  useGetBranchQuery,
  useGetBranchByIdQuery,
  useAddBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useUpdateManyBranchMutation
} = branchMasterApi;

export default branchMasterApi;
