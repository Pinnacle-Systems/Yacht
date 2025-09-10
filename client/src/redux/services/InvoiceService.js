import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { INVOICE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const InvoiceFormApi = createApi({
    reducerPath: "Invoice",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["Invoice"],
    endpoints: (builder) => ({
        getInvoice: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: INVOICE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: INVOICE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["Invoice"],
        }),
        getInvoiceById: builder.query({
            query: (id) => {
                return {
                    url: `${INVOICE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Invoice"],
        }),
        addInvoice: builder.mutation({
            query: (payload) => ({
                url: INVOICE_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["Invoice"],
        }),
        updateInvoice: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${INVOICE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["Invoice"],
        }),
        updateManyInvoice: builder.mutation({
            query: (payload) => {
                const { companyId, Invoicees } = payload;
                return {
                    url: `${INVOICE_API}/updateMany/${companyId}`,
                    method: "PUT",
                    body: Invoicees,
                };
            },
            invalidatesTags: ["Invoice"],
        }),
        deleteInvoice: builder.mutation({
            query: (id) => ({
                url: `${INVOICE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Invoice"],
        }),
    }),
});

export const {
    useGetInvoiceQuery,
    useGetInvoiceByIdQuery,
    useAddInvoiceMutation,
    useUpdateInvoiceMutation,
    useDeleteInvoiceMutation,
    useUpdateManyInvoiceMutation
} = InvoiceFormApi;

export default InvoiceFormApi;
