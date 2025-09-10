import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CERTIFICATE_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const CertificateMasterApi = createApi({
  reducerPath: "certificateMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Certificate"],
  endpoints: (builder) => ({
    getCertificate: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: CERTIFICATE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: CERTIFICATE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Certificate"],
    }),
    getCertificateById: builder.query({
      query: (id) => {
        return {
          url: `${CERTIFICATE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Certificate"],
    }),
    addCertificate: builder.mutation({
      query: (payload) => ({
        url: CERTIFICATE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Certificate"],
    }),
    updateCertificate: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${CERTIFICATE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Certificate"],
    }),
    deleteCertificate: builder.mutation({
      query: (id) => ({
        url: `${CERTIFICATE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Certificate"],
    }),
  }),
});

export const {
  useGetCertificateQuery,
  useGetCertificateByIdQuery,
  useAddCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
} = CertificateMasterApi;

export default CertificateMasterApi;
