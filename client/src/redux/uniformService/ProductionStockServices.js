import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRODUCTION_STOCK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const productionStockApi = createApi({
  reducerPath: "productionStock",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ProductionStock"],
  endpoints: (builder) => ({
    getStyleDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${PRODUCTION_STOCK_API}/styleDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["ProductionStock"],
    }),
    getProductionDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${PRODUCTION_STOCK_API}/productionStyle`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["ProductionStock"],
    }),
  }),
});

export const { useLazyGetStyleDetailQuery, useLazyGetProductionDetailQuery } =
  productionStockApi;

export default productionStockApi;
