import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LOSS_REASON_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const LossReasonApi = createApi({
  reducerPath: "lossReason",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["LossReason"],
  endpoints: (builder) => ({
    getLossReason: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: LOSS_REASON_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: LOSS_REASON_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["LossReason"],
    }),
    getLossReasonById: builder.query({
      query: (id) => {
        return {
          url: `${LOSS_REASON_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LossReason"],
    }),
    addLossReason: builder.mutation({
      query: (payload) => ({
        url: LOSS_REASON_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["LossReason"],
    }),
    updateLossReason: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${LOSS_REASON_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LossReason"],
    }),
    deleteLossReason: builder.mutation({
      query: (id) => ({
        url: `${LOSS_REASON_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LossReason"],
    }),
  }),
});

export const {
  useGetLossReasonQuery,
  useGetLossReasonByIdQuery,
  useAddLossReasonMutation,
  useUpdateLossReasonMutation,
  useDeleteLossReasonMutation,
} = LossReasonApi;

export default LossReasonApi;
