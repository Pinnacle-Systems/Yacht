import React from "react";
import moment from "moment";
import { useGetHolidaysCalenderQuery } from "../../../redux/services/HolidaysServices";
import { useState } from "react";
import { useEffect } from "react";
import { Loader } from "../../../Basic/components";


const HolidayReport = ({ onClick }) => {
    const { data: allData, isLoading, isFetching } = useGetHolidaysCalenderQuery({});
    const [holidays, setHolidays] = useState([])

    useEffect(() => {
        if (!allData?.data) return
        setHolidays(allData.data)
    }, [allData, isLoading, isFetching]);

    if (isLoading || isFetching || !allData) return <Loader />

    return (
        <div className='w-full mx-auto h-full bg-gray-100'>
            <div className="text-center font-bold sticky top-0 bg-gray-100"> Holidays</div>
            <table className='table-fixed w-full text-center'>
                <thead className="table-header sticky top-5">
                    <tr className="">
                        <th className="border border-black">
                            Date
                        </th>
                        <th>
                            Reason
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {holidays.map(holiday =>
                        <tr key={holiday.id} className="table-row" onClick={() => onClick(holiday.date)}>
                            <td className="table-data">
                                {moment.utc(holiday.date).format("DD-MM-YYYY")}
                            </td>
                            <td className="table-data">
                                {holiday.description}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default HolidayReport
