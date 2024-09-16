import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SearchSuggestion } from "features/search/utils/FormHelpers";
import { Course } from "types/Course";
import { ScheduleQuery } from "types/ScheduleQuery";

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
        setResults: (state, action: PayloadAction<Course[]>) => {
            state.results = action.payload;
        },
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
        },
        setSearchPending: (state) => {
            state.results = [];
            state.display = true;
            state.pending = true;
        },
        setSearchFulfilled: (state, action: PayloadAction<{ queries: ScheduleQuery[], courses: Course[], refresh: boolean }>) => {
            const { queries, courses, refresh } = action.payload;
            if (!refresh) {
                state.prevQueries = queries;
                state.prevInput = state.input;
                state.prevType = state.type
            } else {
                state.input = state.prevInput;
                state.queries = state.prevQueries;
                state.type = state.prevType;
            }
            state.pending = false;
            state.results = courses;
        }
    }
})

export const { setSearchPending, setSearchFulfilled, setResults, setQuarter, setYear, addQuery, removeQuery, clearQueries, toggleSearchType, setDisplayResults, setSearchSuggestions, setSearchInput, setSearchType } = searchSlice.actions;

export default searchSlice.reducer;