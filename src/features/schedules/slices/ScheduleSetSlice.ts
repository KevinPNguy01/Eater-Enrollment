import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { scheduleAddOffering, scheduleRemoveOffering } from '../../../helpers/Schedule';
import { scheduleSetAdd, scheduleSetReorder } from '../../../helpers/ScheduleSet';
import { offeringEquals } from '../../../helpers/CourseOffering';
import { CourseOffering } from '../../../types/CourseOffering';
import { Schedule } from '../../../types/Schedule';
import { CustomEvent } from '../../../types/CustomEvent';

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
        removeOffering: (state, action: PayloadAction<{offering: CourseOffering, index: number}>) => {
            const {offering, index} = action.payload;
            const schedule = state.scheduleSet[index];
            scheduleRemoveOffering(schedule, offering);
        },
        changeOfferingColor: (state, action: PayloadAction<{offering: CourseOffering, color: string, index: number}>) => {
            const {offering, color, index} = action.payload;
            const schedule = state.scheduleSet[index];
            schedule.courses.forEach(course => {
                course.offerings.forEach(otherOffering => {
                    if (offeringEquals(offering, otherOffering)) {
                        otherOffering.color = color;
                    }
                });
            });
            
        },
        addCustomEvent: (state, action: PayloadAction<{customEvent: CustomEvent, index: number}>) => {
            const {customEvent, index} = action.payload;
            const schedule = state.scheduleSet[index];
            const ids = new Set(schedule.customEvents.map(({id}) => id));
            let id;
            for (id = 0; ids.has(id); ++id);
            customEvent.id = id;
            schedule.customEvents.push(customEvent);
        },
        removeCustomEvent: (state, action: PayloadAction<{id: number, index: number}>) => {
            const {id, index} = action.payload;
            const schedule = state.scheduleSet[index];
            schedule.customEvents = schedule.customEvents.filter(e => e.id !== id);
        },
        changeCustomEventColor: (state, action: PayloadAction<{id: number, color: string, index: number}>) => {
            const {id, color, index} = action.payload;
            const event = state.scheduleSet[index].customEvents.find(e => e.id === id);
            if (event) {
                event.color = color;
            }
        }
    }
})

export const {
    reorderScheduleSet, 
    clearScheduleSet, 
    addSchedule, 
    removeSchedule, 
    duplicateSchedule, 
    renameSchedule, 
    setCurrentScheduleIndex, 
    addOffering, 
    removeOffering, 
    changeOfferingColor,
    addCustomEvent, 
    removeCustomEvent,
    changeCustomEventColor
} = schedulesSlice.actions;

export default schedulesSlice.reducer;