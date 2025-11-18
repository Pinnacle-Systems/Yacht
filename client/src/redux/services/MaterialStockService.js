import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MATERIAL_STOCK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const materialStockApi = createApi({
  reducerPath: "materialStock",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["MaterialStock"],
  endpoints: (builder) => ({
    getMaterialStock: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: MATERIAL_STOCK_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: MATERIAL_STOCK_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MaterialStock"],
    }),
    getFabricDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${MATERIAL_STOCK_API}/styleDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MaterialStock"],
    }),
  }),
});

export const { useGetMaterialStockQuery,useLazyGetFabricDetailQuery } = materialStockApi;

export default materialStockApi;
