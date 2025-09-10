import { getDateTimeRange } from "./helper.js";
import { getTableRecordWithId } from "./helperQueries.js";

export async function getFinYearStartTimeEndTime(finYearId) {
    if (!finYearId) return null
    const data = await getTableRecordWithId(finYearId, "finYear")
    if (!data) return null;
    let startDate = data.from;
    let endDate = data.to;
    const { startTime: startDateStartTime } = getDateTimeRange(startDate);
    const { endTime: endDateEndTime } = getDateTimeRange(endDate);
    return { startDateStartTime, endDateEndTime }
}