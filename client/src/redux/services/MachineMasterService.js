import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MACHINE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const machineMasterApi = createApi({
  reducerPath: "machineMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Machine"],
  endpoints: (builder) => ({
    getMachine: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: MACHINE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: MACHINE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Machine"],
    }),
    getMachineById: builder.query({
      query: (id) => {
        return {
          url: `${MACHINE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Machine"],
    }),
    addMachine: builder.mutation({
      query: (payload) => ({
        url: MACHINE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Machine"],
    }),
    updateMachine: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${MACHINE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Machine"],
    }),
    deleteMachine: builder.mutation({
      query: (id) => ({
        url: `${MACHINE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Machine"],
    }),
  }),
});

export const {
  useGetMachineQuery,
  useGetMachineByIdQuery,
  useAddMachineMutation,
  useUpdateMachineMutation,
  useDeleteMachineMutation,
} = machineMasterApi;

export default machineMasterApi;
