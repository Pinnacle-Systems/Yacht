import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRODUCT_CATEGORY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const productCategoryMasterApi = createApi({
  reducerPath: "productCategoryMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ProductCategory"],
  endpoints: (builder) => ({
    getProductCategory: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PRODUCT_CATEGORY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PRODUCT_CATEGORY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["ProductCategory"],
    }),
    getProductCategoryById: builder.query({
      query: (id) => {
        return {
          url: `${PRODUCT_CATEGORY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["ProductCategory"],
    }),
    addProductCategory: builder.mutation({
      query: (payload) => ({
        url: PRODUCT_CATEGORY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["ProductCategory"],
    }),
    updateProductCategory: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PRODUCT_CATEGORY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ProductCategory"],
    }),
    deleteProductCategory: builder.mutation({
      query: (id) => ({
        url: `${PRODUCT_CATEGORY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductCategory"],
    }),
  }),
});

export const {
  useGetProductCategoryQuery,
  useGetProductCategoryByIdQuery,
  useAddProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
} = productCategoryMasterApi;

export default productCategoryMasterApi;
