import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SHOWROOM_STOCK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const showroomStockApi = createApi({
  reducerPath: "showroomStock",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ShowroomStock"],
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
      providesTags: ["ShowroomStock"],
    }),
  }),
});

export const { useLazyGetSRBarcodeDetailQuery } = showroomStockApi;

export default showroomStockApi;
