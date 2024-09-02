import { configureStore } from '@reduxjs/toolkit'
import schedulesReducer from "../features/store/slices/ScheduleSetSlice"
import undoable from "redux-undo";

export const store = configureStore({
    reducer: {
        schedules: undoable(schedulesReducer)
    }
});

export type IRootState = ReturnType<typeof store.getState>;