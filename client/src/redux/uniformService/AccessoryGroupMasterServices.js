import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ACCESSORY_GROUP_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryGroupMasterApi = createApi({
  reducerPath: "accessoryGroupMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["AccessoryGroupMaster"],
  endpoints: (builder) => ({
    getAccessoryGroupMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: ACCESSORY_GROUP_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: ACCESSORY_GROUP_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["AccessoryGroupMaster"],
    }),
    getAccessoryGroupMasterById: builder.query({
      query: (id) => {
        return {
          url: `${ACCESSORY_GROUP_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["AccessoryGroupMaster"],
    }),
    addAccessoryGroupMaster: builder.mutation({
      query: (payload) => ({
        url: ACCESSORY_GROUP_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["AccessoryGroupMaster"],
    }),
    updateAccessoryGroupMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${ACCESSORY_GROUP_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["AccessoryGroupMaster"],
    }),
    deleteAccessoryGroupMaster: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORY_GROUP_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AccessoryGroupMaster"],
    }),
  }),
});

export const {
  useGetAccessoryGroupMasterQuery,
  useGetAccessoryGroupMasterByIdQuery,
  useAddAccessoryGroupMasterMutation,
  useUpdateAccessoryGroupMasterMutation,
  useDeleteAccessoryGroupMasterMutation,
} = AccessoryGroupMasterApi;

export default AccessoryGroupMasterApi;
