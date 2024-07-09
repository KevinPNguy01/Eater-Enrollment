import { useContext } from "react";
import { SearchContext } from "./CoursesPane";
import { SearchForms } from "./SearchForms";
import { SearchResults } from "./SearchResults";

export function SearchTab() {
    const {searchResultsVisibility} = useContext(SearchContext);
    return !searchResultsVisibility ? <SearchForms/> : <SearchResults/>;   
}