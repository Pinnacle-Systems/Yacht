import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SHIFT_COMMAN_TEMPLATE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ShiftCommonTemplateMasterApi = createApi({
  reducerPath: "ShiftCommonTemplateMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ShiftCommonTemplate"],
  endpoints: (builder) => ({
    getShiftCommonTemplate: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SHIFT_COMMAN_TEMPLATE_API  + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: SHIFT_COMMAN_TEMPLATE_API ,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags:["ShiftCommonTemplate"],
    }),
    getShiftCommonTemplateById: builder.query({
      query: (id) => {
        return {
          url: `${SHIFT_COMMAN_TEMPLATE_API }/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["ShiftCommonTemplate"],
    }),
    addShiftCommonTemplate: builder.mutation({
      query: (payload) => ({
        url: SHIFT_COMMAN_TEMPLATE_API ,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["ShiftCommonTemplate"],
    }),
    updateShiftCommonTemplate: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${SHIFT_COMMAN_TEMPLATE_API }/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ShiftCommonTemplate"],
    }),
    deleteShiftCommonTemplate: builder.mutation({
      query: (id) => ({
        url: `${SHIFT_COMMAN_TEMPLATE_API }/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShiftCommonTemplate"],
    }),
  }),
});

export const {
  useGetShiftCommonTemplateQuery,
  useGetShiftCommonTemplateByIdQuery,
  useAddShiftCommonTemplateMutation,
  useUpdateShiftCommonTemplateMutation,
  useDeleteShiftCommonTemplateMutation,
} = ShiftCommonTemplateMasterApi;

export default ShiftCommonTemplateMasterApi;
