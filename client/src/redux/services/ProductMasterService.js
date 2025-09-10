import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRODUCT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const productMasterApi = createApi({
  reducerPath: "productMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProduct: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PRODUCT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PRODUCT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Product"],
    }),
    getProductById: builder.query({
      query: (id) => {
        return {
          url: `${PRODUCT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Product"],
    }),
    addProduct: builder.mutation({
      query: (payload) => ({
        url: PRODUCT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PRODUCT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productMasterApi;

export default productMasterApi;
