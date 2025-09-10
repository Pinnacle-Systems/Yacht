import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SHIFT_TEMPLATE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ShiftTemplateMasterApi = createApi({
  reducerPath: "ShiftTemplateMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ShiftTemplateMaster"],
  endpoints: (builder) => ({
    getShiftTemplateMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SHIFT_TEMPLATE_API  + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: SHIFT_TEMPLATE_API ,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["ShiftTemplateMaster"],
    }),
    getShiftTemplateMasterById: builder.query({
      query: (id) => {
        return {
          url: `${SHIFT_TEMPLATE_API }/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["ShiftTemplateMaster"],
    }),
    addShiftTemplateMaster: builder.mutation({
      query: (payload) => ({
        url: SHIFT_TEMPLATE_API ,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["ShiftTemplateMaster"],
    }),
    updateShiftTemplateMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${SHIFT_TEMPLATE_API }/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ShiftTemplateMaster"],
    }),
    deleteShiftTemplateMaster: builder.mutation({
      query: (id) => ({
        url: `${SHIFT_TEMPLATE_API }/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShiftTemplateMaster"],
    }),
  }),
});

export const {
  useGetShiftTemplateMasterQuery,
  useGetShiftTemplateMasterByIdQuery,
  useAddShiftTemplateMasterMutation,
  useUpdateShiftTemplateMasterMutation,
  useDeleteShiftTemplateMasterMutation,
} = ShiftTemplateMasterApi;

export default ShiftTemplateMasterApi;
