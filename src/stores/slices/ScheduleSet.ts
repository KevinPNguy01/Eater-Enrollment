import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { offeringEquals } from 'helpers/CourseOffering';
import { scheduleAddCustomEvent, scheduleAddOffering, scheduleClear, scheduleCopy, scheduleRemoveCustomEvent, scheduleRemoveOffering } from 'helpers/Schedule';
import { scheduleSetAdd, scheduleSetRemove, scheduleSetReorder } from 'helpers/ScheduleSet';
import { CourseOffering } from 'types/CourseOffering';
import { CustomEvent } from 'types/CustomEvent';
import { Schedule } from 'types/Schedule';

export const schedulesSlice = createSlice({
    name: "schedules",
    initialState: {
        scheduleSet: [{ id: 0, name: "New Schedule", courses: [], customEvents: [] }] as Schedule[],
        selectedIndex: 0
    },
    reducers: {
        setState: (state, action: PayloadAction<{ scheduleSet: Schedule[], selectedIndex: number }>) => {
            Object.assign(state, action.payload);
        },
        reorderScheduleSet: (state, action: PayloadAction<{ start: number, end: number }>) => {
            const { start, end } = action.payload;
            state.scheduleSet = scheduleSetReorder(state.scheduleSet, start, end);
        },
        clearScheduleSet: (state) => {
            state.scheduleSet = [];
        },
        addSchedule: (state, action: PayloadAction<Schedule>) => {
            scheduleSetAdd(state.scheduleSet, action.payload);
        },
        removeSchedule: (state, action: PayloadAction<number>) => {
            scheduleSetRemove(state.scheduleSet, action.payload);
            state.selectedIndex = Math.min(state.selectedIndex, state.scheduleSet.length - 1);
        },
        duplicateSchedule: (state, action: PayloadAction<number>) => {
            scheduleSetAdd(state.scheduleSet, scheduleCopy(state.scheduleSet[action.payload]));
        },
        renameSchedule: (state, action: PayloadAction<{ index: number, name: string }>) => {
            const { index, name } = action.payload;
            state.scheduleSet[index].name = name;
        },
        setCurrentScheduleIndex: (state, action: PayloadAction<number>) => {
            state.selectedIndex = action.payload;
        },
        clearSchedule: (state, action: PayloadAction<number>) => {
            scheduleClear(state.scheduleSet[action.payload]);
        },
        addOffering: (state, action: PayloadAction<{ offering: CourseOffering, index: number }>) => {
            const { offering, index } = action.payload;
            const schedule = state.scheduleSet[index];
            scheduleAddOffering(schedule, offering);
        },
        removeOffering: (state, action: PayloadAction<{ offering: CourseOffering, index: number }>) => {
            const { offering, index } = action.payload;
            const schedule = state.scheduleSet[index];
            scheduleRemoveOffering(schedule, offering);
        },
        changeOfferingColor: (state, action: PayloadAction<{ offering: CourseOffering, color: string, index: number }>) => {
            const { offering, color, index } = action.payload;
            const schedule = state.scheduleSet[index];
            schedule.courses.forEach(course => {
                course.offerings.forEach(otherOffering => {
                    if (offeringEquals(offering, otherOffering)) {
                        otherOffering.color = color;
                    }
                });
            });

        },
        addCustomEvent: (state, action: PayloadAction<{ customEvent: CustomEvent, index: number }>) => {
            const { customEvent, index } = action.payload;
            const schedule = state.scheduleSet[index];
            scheduleAddCustomEvent(schedule, customEvent);
        },
        removeCustomEvent: (state, action: PayloadAction<{ customEvent: CustomEvent, index: number }>) => {
            const { customEvent, index } = action.payload;
            const schedule = state.scheduleSet[index];
            scheduleRemoveCustomEvent(schedule, customEvent);
        },
        changeCustomEventColor: (state, action: PayloadAction<{ customEvent: CustomEvent, color: string, index: number }>) => {
            const { customEvent, color, index } = action.payload;
            const event = state.scheduleSet[index].customEvents.find(e => e.id === customEvent.id);
            if (event) {
                event.color = color;
            }
        },
        updateCustomEvent: (state, action: PayloadAction<{ customEvent: CustomEvent, index: number }>) => {
            const { customEvent, index } = action.payload;
            const event = state.scheduleSet[index].customEvents.find(e => e.id === customEvent.id);
            if (event) {
                Object.assign(event, customEvent);
            }
        }
    }
})

export const {
    setState,
    reorderScheduleSet,
    clearScheduleSet,
    addSchedule,
    removeSchedule,
    duplicateSchedule,
    renameSchedule,
    clearSchedule,
    setCurrentScheduleIndex,
    addOffering,
    removeOffering,
    changeOfferingColor,
    addCustomEvent,
    removeCustomEvent,
    changeCustomEventColor,
    updateCustomEvent
} = schedulesSlice.actions;

export default schedulesSlice.reducer;