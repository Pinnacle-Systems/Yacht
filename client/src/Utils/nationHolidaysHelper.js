import { isHoliday } from "../Basic/components/HolidayForm/helper";
import { getDateArray } from "../../src/helper";

export function findNationalHolidaysBetweenDates(start, end, holidays) {
    const allDates = getDateArray(start, end);
    return allDates.filter(date => isNationalHoliday(date, holidays)).length
}

export function findSundaysBetweenDates(start, end) {
    const allDates = getDateArray(start, end);
    return allDates.filter(date => isSunday(date)).length
}

export function findHolidaysBetweenDates(start, end, holidays) {
    const allDates = getDateArray(start, end);
    return allDates.filter(date => isHoliday(date, holidays)).length
}

export function isSunday(date) {
    return new Date(date).getDay() === 0
}

export function isNationalHoliday(date, holidays) {
    return isSunday(date) || isHoliday(date, holidays)
}