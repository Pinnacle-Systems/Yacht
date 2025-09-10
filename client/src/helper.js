import moment from "moment";
import { IMAGE_UPLOAD_URL } from "./Constants";

export function adjust(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

export const isCurrentOrderLineActive = (orderId, lineId, activeLineOrder) => {
    if (Object.keys(activeLineOrder).length === 0) return false
    return ((parseInt(orderId) === parseInt(activeLineOrder?.orderId)) && (parseInt(lineId) === parseInt(activeLineOrder?.lineId)))
}

export const getTotalPcsInLineOrder = (orders, currentOrder) => {
    let totalPcs = 0;
    const currentUpdateOrderDetails = orders.find(o => parseInt(o.id) === parseInt(currentOrder.id))
    currentUpdateOrderDetails?.lines.forEach(element => {
        totalPcs += parseInt(element.pcs)
    });
    return totalPcs
}

export const getTotalPcsInLineOrderExceptCurrentLine = (orders, currentOrder, currentLine) => {
    let totalPcs = 0;
    const currentUpdateOrderDetails = orders.find(o => parseInt(o.id) === parseInt(currentOrder.id))
    currentUpdateOrderDetails?.lines.filter(line => parseInt(line.id) !== parseInt(currentLine)).forEach(element => {
        totalPcs += parseInt(element.pcs)
    });
    return totalPcs
}

export function getCurrentLine(orders, order, line) {
    const currentOrder = findItem(orders, order.id);
    return currentOrder?.lines ? findItem(currentOrder.lines, line.id) : null
}

export function getBalancePcs(orderQuantity, totalSplitedPcs) {
    return orderQuantity - totalSplitedPcs
}

export const orderAssignment = (orders, setOrders, order, line, pcs, days, startDate, endDate, holidays) => {
    let orderIndex = findItemIndex(orders, order.id);
    const newOrders = structuredClone(orders);
    let linesLocal = filterItem(newOrders[orderIndex]["lines"], line.id);
    if (parseInt(pcs) === parseInt(order.quantity)) {
        linesLocal = [];
    }
    linesLocal.push(
        {
            id: line.id,
            pcs: pcs,
            startDate,
            endDate,
            days: days
        })
    newOrders[orderIndex]["line"] = [];
    newOrders[orderIndex]["lines"] = linesLocal;
    let ordersInCurrentLine = getOrdersInCurrentLine(order.id, line.id, newOrders);
    const currentOrderInOrders = findItem(newOrders, order.id);
    const matchingOrdersList = ordersInCurrentLine.map((loopOrder) => {
        const matchingDays = matchingDatesbetweenOrders(currentOrderInOrders, loopOrder, line);
        if (matchingDays !== 0) {
            let currentOrderCurrentLine = findItem(loopOrder.lines, line.id);
            let startDate = new Date(endDate)
            startDate.setDate(startDate.getDate() + 1);
            let loopOrderDays = findDays(currentOrderCurrentLine.pcs, line);
            let loopOrderendDate = getEndDate(startDate, loopOrderDays);
            loopOrderendDate = endDateLoopFinder(startDate, loopOrderendDate, holidays);

            orderAssignment(newOrders, setOrders, loopOrder, line, currentOrderCurrentLine.pcs, loopOrderDays, startDate, loopOrderendDate, holidays)
        }
        return matchingDays
    })
    if (!matchingOrdersList.some(item => item > 0)) {
        setOrders(newOrders);
    }
}

function getOrdersInCurrentLine(orderId, lineId, orders) {
    let ordersIncurrentLine = []
    orders.filter(order => parseInt(order.id) !== parseInt(orderId)).forEach(order => {
        order.lines.filter(line => parseInt(line.id) === parseInt(lineId)).forEach(line => ordersIncurrentLine.push(order))
    });
    return ordersIncurrentLine
}





function filterItem(itemArray, itemId) {
    return itemArray.filter(item => parseInt(item.id) !== parseInt(itemId))
}

export const getDateFromDateTimeFormat = (date) => moment.utc(date).format("YYYY-MM-DD");


function matchingDatesbetweenOrders(currentOrder, looporder, line) {
    let currentOrderCurrentLine = currentOrder.lines.find(l => parseInt(l.id) === parseInt(line.id))
    let loopOrderCurrentLine = looporder.lines.find(l => parseInt(l.id) === parseInt(line.id))
    const currentOrderDates = getDateArray(new Date(currentOrderCurrentLine.startDate), new Date(currentOrderCurrentLine.endDate)).map(date => getDateFromDateTimeFormat(date));
    let loopOrderDates = getDateArray(new Date(loopOrderCurrentLine.startDate), new Date(loopOrderCurrentLine.endDate)).map(date => getDateFromDateTimeFormat(date));
    let matchingDates = currentOrderDates.filter((date) => loopOrderDates.includes(date));
    return matchingDates.length
}

export const getEndDate = (startDate, days) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1)
    return endDate
}

export const findDays = (pcs, line) => {
    return Math.ceil(pcs / getCurrentCapacity(line.efficiency, line.capacity));
}

export function getCurrentCapacity(efficiency, capacity) {
    return (parseInt(efficiency) * parseInt(capacity)) / 100;
}

export function endDateLoopFinder(startDate, endDate, holidays) {
    let nationalDays = 0;
    let localStartDate = new Date(startDate);
    let localEndDate = new Date(endDate);
    while (findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays) > nationalDays) {
        nationalDays = findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays)
        localEndDate.setDate(new Date(endDate).getDate() + findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays))
    }
    return localEndDate
}

const findItem = (itemArray, itemId) => {
    return itemArray.find(item => parseInt(item.id) === parseInt(itemId))
}

const findItemIndex = (itemArray, itemId) => {
    return itemArray.findIndex(item => parseInt(item.id) === parseInt(itemId))
}
export function findNationalHolidaysBetweenDates(start, end, holidays) {
    const allDates = getDateArray(start, end);
    return allDates.filter(date => isNationalHoliday(date, holidays)).length
}

export function findSundaysBetweenDates(start, end) {
    const allDates = getDateArray(start, end);
    return allDates.filter(date => isSunday(date)).length
}

export function isSameDay(d1, d2) {
    return moment.utc(d1).format("YYYY-MM-DD") === moment.utc(d2).format("YYYY-MM-DD")
}

export const getDateArray = function (start, end) {
    let arr = [];
    let dt = new Date(start);
    end = new Date(end);
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
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

export function isHoliday(date, holidays) {
    return holidays.find(holiday => isSameDay(holiday.date, date))
}

export function arrayCounter(arr) {
    const counts = {};
    for (const num of arr) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    return counts
}

export function getWeekDays(currentMonthDays) {
    return Object.keys(arrayCounter(currentMonthDays.map(date => moment.utc(date).format('W'))))
}

export function sortWeekDaysIfLastWeek(currentMonthDays) {
    let weekArray = getWeekDays(currentMonthDays)
    if (weekArray.includes("52") && weekArray.includes("1")) {
        weekArray = [...weekArray.filter(week => parseInt(week) >= 42), ...weekArray.filter(week => parseInt(week) >= 1 && parseInt(week) <= 10)]
        weekArray = [...new Set(weekArray)]
    }
    return weekArray
}


export function getImageUrlPath(fileName) {
    return `${IMAGE_UPLOAD_URL}${fileName}`
}