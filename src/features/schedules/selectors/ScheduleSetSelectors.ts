import { IRootState } from "../../../app/store";

export const selectScheduleSet = (state: IRootState) => state.schedules.scheduleSet;

export const selectSchedule = (index: number) => (state: IRootState) => state.schedules.scheduleSet[index];

export const selectCurrentSchedule = (state: IRootState) => state.schedules.scheduleSet[state.schedules.selectedIndex];

export const selectCurrentScheduleIndex = (state: IRootState) => state.schedules.selectedIndex;