import React, { useState, useEffect } from 'react';
import { getDateArray } from '../../../../src/Utils/helper';
import moment from 'moment';
import { isSunday } from '../../../../src/Utils/nationHolidaysHelper';
import { isHoliday } from './helper';
import { sortWeekDaysIfLastWeek } from '../../../../src/helper';

const weekday = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]


const Calendar = ({ month, holidays, handleDateClick }) => {
    const [currentMonthDays, setCurrentMonthDays] = useState([]);
    useEffect(() => {
        const startDate = new Date();
        const endDate = new Date();
        const currentYear = new Date(month).getFullYear();
        const currentMonth = new Date(month).getMonth();
        startDate.setFullYear(currentYear, currentMonth, 1);
        endDate.setFullYear(currentYear, currentMonth + 1, 0);
        setCurrentMonthDays(getDateArray(startDate, endDate));
    }, [month, holidays])


    function currentWeekDays(weekday) {
        return currentMonthDays.filter(date => parseInt(moment.utc(date).format('W')) === parseInt(weekday))
    }

    function skipBeforeDaysOfLastMonth(weekday) {
        if (isSunday(currentWeekDays(weekday).at(0))) {
            return [...Array(6)]
        }
        return [...Array(currentWeekDays(weekday).at(0).getDay() - 1)]
    }

    return (
        <div className='w-5/6 mx-auto h-full'>
            <table className='table-fixed h-5/6 w-full border-2 border-black' style={{ width: "100%" }}>
                <thead className='border'>{console.log(holidays)}
                    <tr>
                        <th className='p-1 border bg-blue-100 border-black text-black font-bold'>Week Number</th>
                        {weekday.map((week, index) => <th key={index} className='border bg-blue-100 border-black text-black font-bold'>{week}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {
                        sortWeekDaysIfLastWeek(currentMonthDays).map((weekday, rowIndex) =>
                            <tr key={rowIndex} className="border">
                                <td className='flex justify-center items-center h-full border bg-blue-100 border-black text-black font-bold'>
                                    {weekday}
                                </td>
                                {rowIndex === 0 ?
                                    skipBeforeDaysOfLastMonth(weekday).map((x, i) => <td className='border-2 border-black' key={i}></td>)
                                    :
                                    ""}
                                {currentWeekDays(weekday)
                                    .map((date, index) =>
                                        <td key={index} className="border-2 border-black" onClick={() => handleDateClick(date)}>
                                            <div className='flex  flex-col justify-center items-center h-full font-bold'>
                                                <div>
                                                    {new Date(date).getDate(date)}
                                                </div>
                                                {/* <div>
                                                    {moment.weekdaysShort().at(new Date(date).getDay())}
                                                </div> */}
                                                <div className='text-center bg-green-200'>
                                                    {isHoliday(date, holidays)?.description}
                                                </div>
                                            </div>
                                        </td>)}
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Calendar
