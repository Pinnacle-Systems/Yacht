import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BARCODE_SEQ_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const barcodeSeqMasterApi = createApi({
  reducerPath: "barcodeSeqMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["BarcodeSeq"],
  endpoints: (builder) => ({
    getBarcodeSeq: builder.query({
      query: ({searchParams}) => {
        if(searchParams){
          return {
            url: BARCODE_SEQ_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          };
        }
        return {
          url: BARCODE_SEQ_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["BarcodeSeq"],
    }),
    getBarcodeSeqById: builder.query({
      query: (id) => {
        return {
          url: `${BARCODE_SEQ_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["BarcodeSeq"],
    }),
    addBarcodeSeq: builder.mutation({
      query: (payload) => ({
        url: BARCODE_SEQ_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["BarcodeSeq"],
    }),
    updateBarcodeSeq: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${BARCODE_SEQ_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["BarcodeSeq"],
    }),
    deleteBarcodeSeq: builder.mutation({
      query: (id) => ({
        url: `${BARCODE_SEQ_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BarcodeSeq"],
    })
  }),
  
});

export const {
  useGetBarcodeSeqQuery,
  useGetBarcodeSeqByIdQuery,
  useLazyGetBarcodeSeqByIdQuery,
  useAddBarcodeSeqMutation,
  useUpdateBarcodeSeqMutation,
  useDeleteBarcodeSeqMutation
} = barcodeSeqMasterApi;

export default barcodeSeqMasterApi;
