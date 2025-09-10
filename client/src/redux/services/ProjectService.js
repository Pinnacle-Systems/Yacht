import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PROJECT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ProjectFormApi = createApi({
  reducerPath: "Project",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProject: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PROJECT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PROJECT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Project"],
    }),



    getProjectById: builder.query({
      query: (id) => {
        return {
          url: `${PROJECT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Project"],
    }),
    addProject: builder.mutation({
      query: (payload) => ({
        url: PROJECT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Project"],
    }),
    updateProject: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PROJECT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Project"],
    }),
    updateManyProject: builder.mutation({
      query: (payload) => {
        const { companyId, Projectes } = payload;
        return {
          url: `${PROJECT_API}/updateMany/${companyId}`,
          method: "PUT",
          body: Projectes,
        };
      },
      invalidatesTags: ["Project"],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `${PROJECT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),
  }),
});

export const {
  useGetProjectQuery,

  useGetProjectByIdQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdateManyProjectMutation
} = ProjectFormApi;

export default ProjectFormApi;
