import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CourseOffering, Schedule, CustomEvent } from '../../../constants/Types'
import { scheduleAddOffering, scheduleRemoveOffering } from '../../../utils/Schedule';
import { scheduleSetAdd, scheduleSetReorder } from '../../../utils/ScheduleSet';

export const schedulesSlice = createSlice({
    name: "schedules",
    initialState: {
        scheduleSet: [{id: 0, name: "New Schedule", courses: [], customEvents: []}] as Schedule[],
        selectedIndex: 0
    },
    reducers: {
        reorderScheduleSet: (state, action: PayloadAction<{start: number, end: number}>) => {
            const {start, end} = action.payload;
            state.scheduleSet = scheduleSetReorder(state.scheduleSet, start, end);
        },
        clearScheduleSet: (state) => {
            state.scheduleSet = [];
        },
        addSchedule: (state, action: PayloadAction<Schedule>) => {
            scheduleSetAdd(state.scheduleSet, action.payload);
        },
        removeSchedule: (state, action: PayloadAction<number>) => {
            if (state.scheduleSet.length > 1) {
                state.scheduleSet.splice(action.payload, 1);
                state.selectedIndex = Math.min(state.selectedIndex, state.scheduleSet.length-1);
            }
        },
        duplicateSchedule: (state, action: PayloadAction<number>) => {
            const newSchedule = {...state.scheduleSet[action.payload]};
            newSchedule.courses = [...newSchedule.courses].map(course => {
                const newCourse = {...course};
                newCourse.offerings = [...course.offerings];
                return newCourse;
            });
            scheduleSetAdd(state.scheduleSet, newSchedule);
        },
        renameSchedule: (state, action: PayloadAction<{index: number, name: string}>) => {
            const {index, name} = action.payload;
            state.scheduleSet[index].name = name;
        },
        setCurrentScheduleIndex: (state, action: PayloadAction<number>) => {
            state.selectedIndex = action.payload;
        },
        addOffering: (state, action: PayloadAction<{offering: CourseOffering, index: number}>) => {
            const {offering, index} = action.payload;
            const schedule = state.scheduleSet[index];
            scheduleAddOffering(schedule, offering);
        },
        removeOffering: (state, action: PayloadAction<CourseOffering>) => {
            const schedule = state.scheduleSet[state.selectedIndex];
            const offering = action.payload;
            scheduleRemoveOffering(schedule, offering);
        },
        addCustomEvent: (state, action: PayloadAction<CustomEvent>) => {
            const schedule = state.scheduleSet[state.selectedIndex];
            const customEvent = action.payload;
            const ids = new Set(schedule.customEvents.map(({id}) => id));
            let id;
            for (id = 0; ids.has(id); ++id);
            customEvent.id = id;
            schedule.customEvents.push(customEvent);
        },
        removeCustomEvent: (state, action: PayloadAction<number>) => {
            const schedule = state.scheduleSet[state.selectedIndex];
            schedule.customEvents = schedule.customEvents.filter(({id}) => id !== action.payload);
        }
    }
})

export const {reorderScheduleSet, clearScheduleSet, addSchedule, removeSchedule, duplicateSchedule, renameSchedule, setCurrentScheduleIndex, addOffering, removeOffering, addCustomEvent, removeCustomEvent} = schedulesSlice.actions;

export default schedulesSlice.reducer;