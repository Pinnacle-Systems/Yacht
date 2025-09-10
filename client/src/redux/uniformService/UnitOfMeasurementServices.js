import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UNIT_OF_MEASUREMENT_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const UnitOfMeasurementMasterApi = createApi({
  reducerPath: "unitOfMeasurementMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["UnitOfMeasurementMaster"],
  endpoints: (builder) => ({
    getUnitOfMeasurementMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: UNIT_OF_MEASUREMENT_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: UNIT_OF_MEASUREMENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["UnitOfMeasurementMaster"],
    }),
    getUnitOfMeasurementMasterById: builder.query({
      query: (id) => {
        return {
          url: `${UNIT_OF_MEASUREMENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["UnitOfMeasurementMaster"],
    }),
    addUnitOfMeasurementMaster: builder.mutation({
      query: (payload) => ({
        url: UNIT_OF_MEASUREMENT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["UnitOfMeasurementMaster"],
    }),
    updateUnitOfMeasurementMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${UNIT_OF_MEASUREMENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["UnitOfMeasurementMaster"],
    }),
    deleteUnitOfMeasurementMaster: builder.mutation({
      query: (id) => ({
        url: `${UNIT_OF_MEASUREMENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UnitOfMeasurementMaster"],
    }),
  }),
});

export const {
  useGetUnitOfMeasurementMasterQuery,
  useGetUnitOfMeasurementMasterByIdQuery,
  useAddUnitOfMeasurementMasterMutation,
  useUpdateUnitOfMeasurementMasterMutation,
  useDeleteUnitOfMeasurementMasterMutation,
} = UnitOfMeasurementMasterApi;

export default UnitOfMeasurementMasterApi;
