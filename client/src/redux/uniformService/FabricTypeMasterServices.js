import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FABRIC_TYPE_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const FabricTypeMasterApi = createApi({
  reducerPath: "fabricTypeMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["FabricTypeMaster"],
  endpoints: (builder) => ({
    getFabricTypeMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: FABRIC_TYPE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: FABRIC_TYPE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["FabricTypeMaster"],
    }),
    getFabricTypeMasterById: builder.query({
      query: (id) => {
        return {
          url: `${FABRIC_TYPE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["FabricTypeMaster"],
    }),
    addFabricTypeMaster: builder.mutation({
      query: (payload) => ({
        url: FABRIC_TYPE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["FabricTypeMaster"],
    }),
    updateFabricTypeMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${FABRIC_TYPE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["FabricTypeMaster"],
    }),
    deleteFabricTypeMaster: builder.mutation({
      query: (id) => ({
        url: `${FABRIC_TYPE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FabricTypeMaster"],
    }),
  }),
});

export const {
  useGetFabricTypeMasterQuery,
  useGetFabricTypeMasterByIdQuery,
  useAddFabricTypeMasterMutation,
  useUpdateFabricTypeMasterMutation,
  useDeleteFabricTypeMasterMutation,
} = FabricTypeMasterApi;

export default FabricTypeMasterApi;
