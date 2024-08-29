import { configureStore } from '@reduxjs/toolkit'
import schedulesReducer from "../features/schedules/slices/ScheduleSetSlice"

export const store = configureStore({
    reducer: {
        schedules: schedulesReducer
    }
});

export type IRootState = ReturnType<typeof store.getState>;