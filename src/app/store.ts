import { configureStore } from '@reduxjs/toolkit'
import schedulesReducer from "../features/store/slices/ScheduleSetSlice"

export const store = configureStore({
    reducer: {
        schedules: schedulesReducer
    }
});

export type IRootState = ReturnType<typeof store.getState>;