import { configureStore } from '@reduxjs/toolkit';
import undoable from "redux-undo";
import schedulesReducer from "stores/slices/ScheduleSetSlice";

export const store = configureStore({
    reducer: {
        schedules: undoable(schedulesReducer)
    }
});

export type IRootState = ReturnType<typeof store.getState>;