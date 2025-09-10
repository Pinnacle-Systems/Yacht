import React, { useState } from 'react'

const CalendarNew = () => {
    const [month, setMonth] = useState("");
    console.log(moment(month).endOf("month").format("d"), "startOfMonth")
    return (
        <div>
            
        </div>
    )
}

export default CalendarNew
