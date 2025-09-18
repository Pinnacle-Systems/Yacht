import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MEASUREMENT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const MeasurementMasterApi = createApi({
  reducerPath: "measurementMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["MeasurementMaster"],
  endpoints: (builder) => ({
    getMeasurementMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: MEASUREMENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: MEASUREMENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MeasurementMaster"],
    }),
    getMeasurementMasterById: builder.query({
      query: (id) => {
        return {
          url: `${MEASUREMENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["MeasurementMaster"],
    }),
    addMeasurementMaster: builder.mutation({
      query: (payload) => ({
        url: MEASUREMENT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["MeasurementMaster"],
    }),
    updateMeasurementMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${MEASUREMENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["MeasurementMaster"],
    }),
    deleteMeasurementMaster: builder.mutation({
      query: (id) => ({
        url: `${MEASUREMENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MeasurementMaster"],
    }),
  }),
});

export const {
  useGetMeasurementMasterQuery,
  useGetMeasurementMasterByIdQuery,
  useAddMeasurementMasterMutation,
  useUpdateMeasurementMasterMutation,
  useDeleteMeasurementMasterMutation,
} = MeasurementMasterApi;

export default MeasurementMasterApi;
