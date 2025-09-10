import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SAMPLE_ENTRY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const sampleEntryApi = createApi({
  reducerPath: "sampleEntry",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["sampleEntry"],
  endpoints: (builder) => ({
    getSampleEntry: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: SAMPLE_ENTRY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: SAMPLE_ENTRY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["sampleEntry"],
    }),
    getSampleEntryById: builder.query({
      query: (id) => {
        return {
          url: `${SAMPLE_ENTRY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["sampleEntry"],
    }),
    addSampleEntry: builder.mutation({
      query: (payload) => ({
        url: SAMPLE_ENTRY_API,
        method: "POST",
        body: payload,
      
      }),
      invalidatesTags: ["sampleEntry"],
    }),
    updateSampleEntry: builder.mutation({
      query:({id, body})=> {
        if(!id){
          console.log("No Id found");
          
        }
          return {
          url: `${SAMPLE_ENTRY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["sampleEntry"],
    }),
    deleteSampleEntry: builder.mutation({
      query: (id) => ({
        url: `${SAMPLE_ENTRY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["sampleEntry"],
    }),
  }),
});

export const {
  useGetSampleEntryQuery,
  useGetSampleEntryByIdQuery,
  useAddSampleEntryMutation,
  useUpdateSampleEntryMutation,
  useDeleteSampleEntryMutation,
} = sampleEntryApi;

export default sampleEntryApi;
