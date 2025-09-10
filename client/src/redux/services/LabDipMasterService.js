import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LAB_DIP_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const labDipMasterApi = createApi({
  reducerPath: "labDipMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["LabDip"],
  endpoints: (builder) => ({
    getBranch: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: LAB_DIP_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: LAB_DIP_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["LabDip"],
    }),
    getBranchById: builder.query({
      query: (id) => {
        return {
          url: `${LAB_DIP_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LabDip"],
    }),
    addBranch: builder.mutation({
      query: (payload) => ({
        url: LAB_DIP_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["LabDip"],
    }),
    updateBranch: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${LAB_DIP_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LabDip"],
    }),
    updateManyBranch: builder.mutation({
      query: (payload) => {
        const { companyId, branches } = payload;
        return {
          url: `${LAB_DIP_API}/updateMany/${companyId}`,
          method: "PUT",
          body: branches,
        };
      },
      invalidatesTags: ["LabDip"],
    }),
    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `${LAB_DIP_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LabDip"],
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
} =labDipMasterApi;

export default labDipMasterApi;
