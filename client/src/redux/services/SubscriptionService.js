import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SUBSCRIPTION_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const subscriptionMasterApi = createApi({
  reducerPath: "subscriptionMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Subcription"],
  endpoints: (builder) => ({
    getSubcription: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: SUBSCRIPTION_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: SUBSCRIPTION_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Subcription"],
    }),
    getSubscriptionById: builder.query({
      query: (id) => {
        return {
          url: `${SUBSCRIPTION_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Subcription"],
    }),
    addSubscription: builder.mutation({
      query: (payload) => ({
        url: SUBSCRIPTION_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Subcription"],
    }),
    updateSubscription: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${SUBSCRIPTION_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Subcription"],
    }),
    deleteSubscription: builder.mutation({
      query: (id) => ({
        url: `${SUBSCRIPTION_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subcription"],
    }),
  }),
});

export const {
  useGetSubcriptionQuery,
  useGetSubscriptionByIdQuery,
  useAddSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = subscriptionMasterApi;

export default subscriptionMasterApi;
