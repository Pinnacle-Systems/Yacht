import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRODUCT_SUB_CATEGORY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const productSubCategoryMasterApi = createApi({
  reducerPath: "productSubCategoryMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ProductSubCategory"],
  endpoints: (builder) => ({
    getProductSubCategory: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PRODUCT_SUB_CATEGORY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        
        return {
          url: PRODUCT_SUB_CATEGORY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["ProductSubCategory"],
    }),
    getProductSubCategoryById: builder.query({
      query: (id) => {
        return {
          url: `${PRODUCT_SUB_CATEGORY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["ProductSubCategory"],
    }),
    addProductSubCategory: builder.mutation({
      query: (payload) => ({
        url: PRODUCT_SUB_CATEGORY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["ProductSubCategory"],
    }),
    updateProductSubCategory: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PRODUCT_SUB_CATEGORY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ProductSubCategory"],
    }),
    deleteProductSubCategory: builder.mutation({
      query: (id) => ({
        url: `${PRODUCT_SUB_CATEGORY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductSubCategory"],
    }),
  }),
});

export const {
  useGetProductSubCategoryQuery,
  useGetProductSubCategoryByIdQuery,
  useAddProductSubCategoryMutation,
  useUpdateProductSubCategoryMutation,
  useDeleteProductSubCategoryMutation,
} = productSubCategoryMasterApi;

export default productSubCategoryMasterApi;
