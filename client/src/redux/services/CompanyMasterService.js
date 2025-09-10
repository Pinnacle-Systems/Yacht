import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COMPANY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const companyMasterApi = createApi({
  reducerPath: "companyMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Company"],
  endpoints: (builder) => ({
    getCompany: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: COMPANY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: COMPANY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Company"],
    }),
    getCompanyById: builder.query({
      query: (id) => {
        return {
          url: `${COMPANY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Company"],
    }),
    addCompany: builder.mutation({
      query: (payload) => ({
        url: COMPANY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Company"],
    }),
    updateCompany: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${COMPANY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Company"],
    }),
    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `${COMPANY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Company"],
    }),
  }),
});

export const {
  useGetCompanyQuery,
  useGetCompanyByIdQuery,
  useAddCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companyMasterApi;

export default companyMasterApi;
