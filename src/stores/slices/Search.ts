import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { requestSchedule } from "api/PeterPortalGraphQL";
import { RootState } from "app/store";
import { SearchSuggestion } from "features/search/utils/FormHelpers";
import { groupOfferings } from "helpers/CourseOffering";
import { Course } from "types/Course";
import { ScheduleQuery } from "types/ScheduleQuery";

/**
 * Fetch the schedule for an array of ScheduleQueries and set it as the search results.
 * If the passed array is empty, then re-search the last executed search.
 */
export const fetchSchedule = createAsyncThunk(
    "search/requestSchedule",
    async (queries: ScheduleQuery[], thunkAPI) => requestSchedule(queries.length ? queries : (thunkAPI.getState() as RootState).searchResults.present.prevQueries)
);

export const searchSlice = createSlice({
    name: "search",
    initialState: {
        quarter: "Fall",
        year: "2024",
        prevInput: "",
        input: "",
        prevQueries: [] as ScheduleQuery[],
        queries: [] as ScheduleQuery[],
        results: [] as Course[],
        suggestions: [] as SearchSuggestion[],
        prevType: "single" as "single" | "multi",
        type: "single" as "single" | "multi",
        display: false,
        pending: false
    },
    reducers: {
        setQuarter: (state, action: PayloadAction<string>) => {
            state.quarter = action.payload;
        },
        setYear: (state, action: PayloadAction<string>) => {
            state.year = action.payload;
        },
        addQuery: (state, action: PayloadAction<ScheduleQuery>) => {
            state.queries.push(action.payload);
            state.input = "";
        },
        removeQuery: (state, action: PayloadAction<number>) => {
            state.queries.splice(action.payload, 1);
        },
        clearQueries: (state) => {
            state.queries = [];
        },
        toggleSearchType: (state) => {
            state.type = state.type === "single" ? "multi" : "single";
        },
        setDisplayResults: (state, action: PayloadAction<boolean>) => {
            state.display = action.payload;
        },
        setSearchSuggestions: (state, action: PayloadAction<SearchSuggestion[]>) => {
            state.suggestions = action.payload;
        },
        setSearchInput: (state, action: PayloadAction<string>) => {
            state.input = action.payload;
        },
        setSearchType: (state, action: PayloadAction<"single" | "multi">) => {
            state.type = action.payload;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchSchedule.pending, (state) => {
                state.results = [];
                state.display = true;
                state.pending = true;
            })
            .addCase(fetchSchedule.fulfilled, (state, action) => {
                if (action.meta.arg.length) {
                    state.prevQueries = action.meta.arg;
                    state.prevInput = state.input;
                    state.prevType = state.type
                } else {
                    state.input = state.prevInput;
                    state.queries = state.prevQueries;
                    state.type = state.prevType;
                }
                state.results = groupOfferings(action.payload);
                state.pending = false;
            })
            .addCase(fetchSchedule.rejected, (_, action) => console.log(action.error))
    }
})

export const { setQuarter, setYear, addQuery, removeQuery, clearQueries, toggleSearchType, setDisplayResults, setSearchSuggestions, setSearchInput, setSearchType } = searchSlice.actions;

export default searchSlice.reducer;