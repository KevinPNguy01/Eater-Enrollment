import { ScheduleQuery } from "types/ScheduleQuery";

export function scheduleQueryToString(query: ScheduleQuery) {
    if (!query) return "";
    return query.ge ? query.ge : query.department + (query.number ? ` ${query.number}` : "")
}