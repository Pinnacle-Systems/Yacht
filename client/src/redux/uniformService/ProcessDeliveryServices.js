import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PROCESS_DELIVERY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProcessDeliveryApi = createApi({
  reducerPath: "processDelivery",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["ProcessDelivery"],
  endpoints: (builder) => ({
    getProcessDelivery: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PROCESS_DELIVERY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PROCESS_DELIVERY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["ProcessDelivery"],
    }),
    getProcessDeliveryProgramItems: builder.query({
      query: ({ params }) => {
        return {
          url: PROCESS_DELIVERY_API + "/getProcessDeliveryProgramItems",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["ProcessDelivery"],
    }),
    getProcessDeliveryById: builder.query({
      query: ({ id, processInwardId, processDeliveryReturnId, params }) => {
        return {
          url: `${PROCESS_DELIVERY_API}/${id}/${processInwardId ? processInwardId : null}/${processDeliveryReturnId ? processDeliveryReturnId : null}`,
          method: "GET",
          params,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["ProcessDelivery"],
    }),
    addProcessDelivery: builder.mutation({
      query: (payload) => ({
        url: PROCESS_DELIVERY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ProcessDelivery"],
    }),
    updateProcessDelivery: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${PROCESS_DELIVERY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["ProcessDelivery"],
    }),
    deleteProcessDelivery: builder.mutation({
      query: (id) => ({
        url: `${PROCESS_DELIVERY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProcessDelivery"],
    }),
  }),
});

export const {
  useGetProcessDeliveryQuery,
  useGetProcessDeliveryProgramItemsQuery,
  useGetProcessDeliveryByIdQuery,
  useAddProcessDeliveryMutation,
  useUpdateProcessDeliveryMutation,
  useDeleteProcessDeliveryMutation,
} = ProcessDeliveryApi;

export default ProcessDeliveryApi;
