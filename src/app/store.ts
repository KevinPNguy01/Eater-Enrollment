import { configureStore, PayloadAction } from '@reduxjs/toolkit';
import undoable, { excludeAction } from "redux-undo";
import gradesReducer from 'stores/slices/Grades';
import schedulesReducer, { setCurrentScheduleIndex } from "stores/slices/ScheduleSet";
import searchReducer, { setSearchFulfilled } from 'stores/slices/Search';
import reviewsReducer from 'stores/slices/Reviews';

export const store = configureStore({
    reducer: {
        schedules: undoable(schedulesReducer, {
            undoType: "schedules/undo",
            redoType: "schedules/redo",
            clearHistoryType: "schedules/clearHistory",
            filter: excludeAction([setCurrentScheduleIndex.type])
        }),
        searchResults: undoable(searchReducer, {
            ignoreInitialState: true,
            undoType: "search/undo",
            redoType: "search/redo",
            clearHistoryType: "search/clearHistory",
            filter: (action: PayloadAction<{ refresh: boolean }>) => action.type === setSearchFulfilled.type && !action.payload.refresh
        }),
        grades: gradesReducer,
        reviews: reviewsReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;