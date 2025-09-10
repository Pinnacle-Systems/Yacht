import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRODUCT_BRAND_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const productBrandMasterApi = createApi({
  reducerPath: "productBrandMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ProductBrand"],
  endpoints: (builder) => ({
    getProductBrand: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PRODUCT_BRAND_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PRODUCT_BRAND_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["ProductBrand"],
    }),
    getProductBrandById: builder.query({
      query: (id) => {
        return {
          url: `${PRODUCT_BRAND_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["ProductBrand"],
    }),
    addProductBrand: builder.mutation({
      query: (payload) => ({
        url: PRODUCT_BRAND_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["ProductBrand"],
    }),
    updateProductBrand: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PRODUCT_BRAND_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ProductBrand"],
    }),
    deleteProductBrand: builder.mutation({
      query: (id) => ({
        url: `${PRODUCT_BRAND_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductBrand"],
    }),
  }),
});

export const {
  useGetProductBrandQuery,
  useGetProductBrandByIdQuery,
  useAddProductBrandMutation,
  useUpdateProductBrandMutation,
  useDeleteProductBrandMutation,
} = productBrandMasterApi;

export default productBrandMasterApi;
