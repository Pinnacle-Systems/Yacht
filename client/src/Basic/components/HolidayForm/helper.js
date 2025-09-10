import moment from "moment"
import { isSameDay } from "../../../Utils/helper"

export function isHoliday(date, holidays) {
    return holidays.find(holiday => isSameDay(holiday.date, date))
}

export function isSameMonth(d1, d2){
    return moment.utc(d1).format("YYYY-MM") === moment.utc(d2).format("YYYY-MM")
}

export function filterByMonth(holidays, month){
    return holidays.filter(holiday => isSameMonth(holiday.date, month))
}

