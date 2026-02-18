import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SHOWROOM_STOCK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const showroomStockApi = createApi({
  reducerPath: "showroomStock",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["showroomStock"],
  endpoints: (builder) => ({
    getSRBarcodeDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${SHOWROOM_STOCK_API}/barcodeDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["showroomStock"],
    }),
    getSRStock: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SHOWROOM_STOCK_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: SHOWROOM_STOCK_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["showroomStock"],
    }),
    getBarcodeList: builder.query({
      query: ({ params }) => {
        return {
          url: `${SHOWROOM_STOCK_API}/barcodeList`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["showroomStock"],
    }),
  }),
});

export const {
  useLazyGetSRBarcodeDetailQuery,
  useGetSRStockQuery,
  useGetBarcodeListQuery,
} = showroomStockApi;

export default showroomStockApi;
