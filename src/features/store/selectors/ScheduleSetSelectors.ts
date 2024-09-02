import { IRootState } from "../../../app/store";

export const selectScheduleSet = (state: IRootState) => state.schedules.present.scheduleSet;

export const selectSchedule = (index: number) => (state: IRootState) => state.schedules.present.scheduleSet[index];

export const selectCurrentSchedule = (state: IRootState) => state.schedules.present.scheduleSet[state.schedules.present.selectedIndex];

export const selectCurrentScheduleIndex = (state: IRootState) => state.schedules.present.selectedIndex;

export const selectPrevState = (state: IRootState) => state.schedules.past[0];
export const selectNextState = (state: IRootState) => state.schedules.future[0];