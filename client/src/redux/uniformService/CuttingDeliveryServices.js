import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CUTTING_DELIVERY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const CuttingDeliveryApi = createApi({
  reducerPath: "cuttingDelivery",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["CuttingDelivery"],
  endpoints: (builder) => ({
    getCuttingDelivery: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: CUTTING_DELIVERY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: CUTTING_DELIVERY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["CuttingDelivery"],
    }),
    getCuttingDeliveryById: builder.query({
      query: (id) => {
        return {
          url: `${CUTTING_DELIVERY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["CuttingDelivery"],
    }),
    addCuttingDelivery: builder.mutation({
      query: (payload) => ({
        url: CUTTING_DELIVERY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["CuttingDelivery"],
    }),
    updateCuttingDelivery: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${CUTTING_DELIVERY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["CuttingDelivery"],
    }),
    deleteCuttingDelivery: builder.mutation({
      query: (id) => ({
        url: `${CUTTING_DELIVERY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CuttingDelivery"],
    }),
  }),
});

export const {
  useGetCuttingDeliveryQuery,
  useGetCuttingDeliveryByIdQuery,
  useAddCuttingDeliveryMutation,
  useUpdateCuttingDeliveryMutation,
  useDeleteCuttingDeliveryMutation,
} = CuttingDeliveryApi;

export default CuttingDeliveryApi;
