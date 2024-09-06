import { RootState } from "app/store";

export const selectScheduleSet = (state: RootState) => state.schedules.present.scheduleSet;

export const selectSchedule = (index: number) => (state: RootState) => state.schedules.present.scheduleSet[index];

export const selectCurrentSchedule = (state: RootState) => state.schedules.present.scheduleSet[state.schedules.present.selectedIndex];

export const selectCurrentScheduleIndex = (state: RootState) => state.schedules.present.selectedIndex;

export const selectPastSchedules = (state: RootState) => state.schedules.past[0];

export const selectFutureSchedules = (state: RootState) => state.schedules.future[0];