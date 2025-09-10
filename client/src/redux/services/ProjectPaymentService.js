import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PROJECTPAYMENT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const projectPaymentFormApi = createApi({
    reducerPath: "projectPayment",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ProjectPayment"],
    endpoints: (builder) => ({
        getProjectPayment: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PROJECTPAYMENT_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: PROJECTPAYMENT_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ProjectPayment"],
        }),

        getProjectPaymentById: builder.query({
            query: ({ id, params }) => {

                return {
                    url: `${PROJECTPAYMENT_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ProjectPayment"],
        }),
        addProjectPayment: builder.mutation({
            query: (payload) => ({
                url: PROJECTPAYMENT_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ProjectPayment"],
        }),
        updateProjectPayment: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${PROJECTPAYMENT_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ProjectPayment"],
        }),

        deleteProjectPayment: builder.mutation({
            query: (id, { params }) => {

                return {
                    url: `${PROJECTPAYMENT_API}/${id}`,
                    method: "DELETE",
                    params,
                }

            },
            invalidatesTags: ["ProjectPayment"],
        }),
    })
});

export const {
    useGetProjectPaymentQuery,

    useGetProjectPaymentByIdQuery,
    useAddProjectPaymentMutation,
    useUpdateProjectPaymentMutation,
    useDeleteProjectPaymentMutation,

} = projectPaymentFormApi;

export default projectPaymentFormApi;
