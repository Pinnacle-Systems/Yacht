import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {TERMS_AND_CONDITIONS_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const TermsAndConditionsMasterApi = createApi({
  reducerPath: "termsAndConditionsMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["TermsAndConditions"],
  endpoints: (builder) => ({
    getTermsAndConditions: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url:TERMS_AND_CONDITIONS_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url:TERMS_AND_CONDITIONS_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["TermsAndConditions"],
    }),
    getTermsAndConditionsById: builder.query({
      query: (id) => {
        return {
          url: `${TERMS_AND_CONDITIONS_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["TermsAndConditions"],
    }),
    addTermsAndConditions: builder.mutation({
      query: (payload) => ({
        url: TERMS_AND_CONDITIONS_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["TermsAndConditions"],
    }),
    updateTermsAndConditions: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${TERMS_AND_CONDITIONS_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["TermsAndConditions"],
    }),
    deleteTermsAndConditions: builder.mutation({
      query: (id) => ({
          url: `${TERMS_AND_CONDITIONS_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TermsAndConditions"],
    }),
  }),
});

export const {
  useGetTermsAndConditionsQuery,
  useGetTermsAndConditionsByIdQuery,
  useAddTermsAndConditionsMutation,
  useUpdateTermsAndConditionsMutation,
  useDeleteTermsAndConditionsMutation,
} = TermsAndConditionsMasterApi;

export default TermsAndConditionsMasterApi;
