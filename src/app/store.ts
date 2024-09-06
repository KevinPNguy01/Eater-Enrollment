import { configureStore, PayloadAction } from '@reduxjs/toolkit';
import undoable from "redux-undo";
import schedulesReducer from "stores/slices/ScheduleSet";
import searchReducer from 'stores/slices/Search';
import { Course } from 'types/Course';
import { ScheduleQuery } from 'types/ScheduleQuery';


export const store = configureStore({
    reducer: {
        schedules: undoable(schedulesReducer, {
            undoType: "schedules/undo",
            redoType: "schedules/redo",
            clearHistoryType: "schedules/clearHistory"
        }),
        searchResults: undoable(searchReducer, {
            ignoreInitialState: true,
            undoType: "search/undo",
            redoType: "search/redo",
            clearHistoryType: "search/clearHistory",
            filter: (action: PayloadAction<Course[], string, {
                arg: ScheduleQuery[];
                requestId: string;
                requestStatus: "fulfilled";
            }, never>) => action.type === "search/requestSchedule/fulfilled" && action.meta.arg.length > 0
        })
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;