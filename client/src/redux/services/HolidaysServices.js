import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HOLIDAYS_CALENDER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const holidaysCalenderMasterApi = createApi({
    reducerPath: "holidaysCalenderMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["HolidaysCalender"],
    endpoints: (builder) => ({
        getHolidaysCalender: builder.query({
            query: ({ searchParams }) => {
                if (searchParams) {
                    return {
                        url: HOLIDAYS_CALENDER_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                    };
                }
                return {
                    url: HOLIDAYS_CALENDER_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["HolidaysCalender"],
        }),
        getHolidaysCalenderById: builder.query({
            query: (id) => {
                return {
                    url: `${HOLIDAYS_CALENDER_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["HolidaysCalender"],
        }),
        addHolidaysCalender: builder.mutation({
            query: (payload) => ({
                url: HOLIDAYS_CALENDER_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["HolidaysCalender"],
        }),
        updateHolidaysCalender: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${HOLIDAYS_CALENDER_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["HolidaysCalender"],
        }),
        deleteHolidaysCalender: builder.mutation({
            query: (id) => ({
                url: `${HOLIDAYS_CALENDER_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["HolidaysCalender"],
        })
    }),

});

export const {
    useGetHolidaysCalenderQuery,
    useGetHolidaysCalenderByIdQuery,
    useAddHolidaysCalenderMutation,
    useUpdateHolidaysCalenderMutation,
    useDeleteHolidaysCalenderMutation
} = holidaysCalenderMasterApi;

export default holidaysCalenderMasterApi;
