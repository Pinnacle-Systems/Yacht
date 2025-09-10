import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FIN_YEAR_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const finYearMasterApi = createApi({
  reducerPath: "finYearMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["FinYear"],
  endpoints: (builder) => ({
    getFinYear: builder.query({
      query: ({searchParams}) => {
        if(searchParams){
          return {
            url: FIN_YEAR_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          };
        }
        return {
          url: FIN_YEAR_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["FinYear"],
    }),
    getFinYearById: builder.query({
      query: (id) => {
        return {
          url: `${FIN_YEAR_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["FinYear"],
    }),
    addFinYear: builder.mutation({
      query: (payload) => ({
        url: FIN_YEAR_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["FinYear"],
    }),
    updateFinYear: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${FIN_YEAR_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["FinYear"],
    }),
    deleteFinYear: builder.mutation({
      query: (id) => ({
        url: `${FIN_YEAR_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FinYear"],
    })
  }),
  
});

export const {
  useGetFinYearQuery,
  useGetFinYearByIdQuery,
  useAddFinYearMutation,
  useUpdateFinYearMutation,
  useDeleteFinYearMutation
} = finYearMasterApi;

export default finYearMasterApi;
