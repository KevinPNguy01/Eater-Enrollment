import { RootState } from "app/store";

export const selectSearchType = (state: RootState) => state.searchResults.present.type;

export const selectSearchResults = (state: RootState) => state.searchResults.present.results;

export const selectScheduleQueries = (state: RootState) => state.searchResults.present.queries;

export const selectSearchQuarter = (state: RootState) => state.searchResults.present.quarter;

export const selectSearchYear = (state: RootState) => state.searchResults.present.year;

export const selectDisplayResults = (state: RootState) => state.searchResults.present.display;

export const selectSearchSuggestions = (state: RootState) => state.searchResults.present.suggestions;

export const selectSearchPending = (state: RootState) => state.searchResults.present.pending;

export const selectSearchInput = (state: RootState) => state.searchResults.present.input;

export const selectPastSearch = (state: RootState) => state.searchResults.past[0];

export const selectFutureSearch = (state: RootState) => state.searchResults.future[0];

export const selectPrevQueries = (state: RootState) => state.searchResults.present.prevQueries;