import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ACCESSORY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryMasterApi = createApi({
  reducerPath: "accessoryMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["AccessoryMaster"],
  endpoints: (builder) => ({
    getAccessoryMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: ACCESSORY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ACCESSORY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["AccessoryMaster"],
    }),
    getAccessoryMasterById: builder.query({
      query: (id) => {
        return {
          url: `${ACCESSORY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["AccessoryMaster"],
    }),
    addAccessoryMaster: builder.mutation({
      query: (payload) => ({
        url: ACCESSORY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["AccessoryMaster"],
    }),
    updateAccessoryMaster: builder.mutation({
      query: ({id, body}) => {
        return {
          url: `${ACCESSORY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["AccessoryMaster"],
    }),
    deleteAccessoryMaster: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AccessoryMaster"],
    }),
  }),
});

export const {
  useGetAccessoryMasterQuery,
  useGetAccessoryMasterByIdQuery,
  useAddAccessoryMasterMutation,
  useUpdateAccessoryMasterMutation,
  useDeleteAccessoryMasterMutation,
} = AccessoryMasterApi;

export default AccessoryMasterApi;
