import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LEAD_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const leadFormApi = createApi({
  reducerPath: "leadForm",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Lead"],
  endpoints: (builder) => ({
    getLead: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: LEAD_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: LEAD_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Lead"],
    }),
    getLeadById: builder.query({
      query: (id) => {
        return {
          url: `${LEAD_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Lead"],
    }),
    addLead: builder.mutation({
      query: (payload) => ({
        url: LEAD_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Lead"],
    }),
    updateLead: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${LEAD_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Lead"],
    }),
    updateManyLead: builder.mutation({
      query: (payload) => {
        const { companyId, Leades } = payload;
        return {
          url: `${LEAD_API}/updateMany/${companyId}`,
          method: "PUT",
          body: Leades,
        };
      },
      invalidatesTags: ["Lead"],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({
        url: `${LEAD_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lead"],
    }),
  }),
});

export const {
  useGetLeadQuery,
  useGetLeadByIdQuery,
  useAddLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useUpdateManyLeadMutation
} = leadFormApi;

export default leadFormApi;
