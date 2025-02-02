import { Schedule } from "types/Schedule";

/**
 * Add a schedule to the schedule set, giving it a unique id.
 * @param scheduleSet 
 * @param schedule 
 */
export function scheduleSetAdd(scheduleSet: Schedule[], schedule: Schedule) {
    let id = 0;
    const ids = new Set(scheduleSet.map(({ id }) => id));
    for (; ids.has(id); ++id);
    schedule.id = id;
    scheduleSet.push(schedule);
}

/**
 * Remove a schedule from the schedule set.
 * @param scheduleSet 
 * @param index 
 */
export function scheduleSetRemove(scheduleSet: Schedule[], index: number) {
    if (scheduleSet.length > 1) {
        scheduleSet.splice(index, 1);
    }
}

export function scheduleSetReorder(schedules: Schedule[], start: number, end: number) {
    return reorderList(schedules, start, end);
}

const reorderList = <T,>(l: T[], start: number, end: number) => {
    if (start < end) return _reorderListForward([...l], start, end);
    else if (start > end) return _reorderListBackward([...l], start, end);
    return l;
};
const _reorderListForward = <T,>(l: T[], start: number, end: number) => {
    const temp = l[start];
    for (let i = start; i < end; i++) {
        l[i] = l[i + 1];
    }
    l[end - 1] = temp;
    return l;
};
const _reorderListBackward = <T,>(l: T[], start: number, end: number) => {
    const temp = l[start];
    for (let i = start; i > end; i--) {
        l[i] = l[i - 1];
    }
    l[end] = temp;
    return l;
};