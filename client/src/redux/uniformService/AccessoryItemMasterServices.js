import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ACCESSORY_ITEM_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryItemMasterApi = createApi({
  reducerPath: "accessoryItemMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["AccessoryItemMaster"],
  endpoints: (builder) => ({
    getAccessoryItemMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: ACCESSORY_ITEM_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ACCESSORY_ITEM_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["AccessoryItemMaster"],
    }),
    getAccessoryItemMasterById: builder.query({
      query: (id) => {
        return {
          url: `${ACCESSORY_ITEM_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["AccessoryItemMaster"],
    }),
    addAccessoryItemMaster: builder.mutation({
      query: (payload) => ({
        url: ACCESSORY_ITEM_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["AccessoryItemMaster"],
    }),
    updateAccessoryItemMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${ACCESSORY_ITEM_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["AccessoryItemMaster"],
    }),
    deleteAccessoryItemMaster: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORY_ITEM_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AccessoryItemMaster"],
    }),
  }),
});

export const {
  useGetAccessoryItemMasterQuery,
  useGetAccessoryItemMasterByIdQuery,
  useAddAccessoryItemMasterMutation,
  useUpdateAccessoryItemMasterMutation,
  useDeleteAccessoryItemMasterMutation,
} = AccessoryItemMasterApi;

export default AccessoryItemMasterApi;
