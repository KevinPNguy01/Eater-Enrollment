import { SearchResultsNavBar, SearchContext } from "../.."
import { useContext } from "react";
import ScheduleResults from "./ScheduleResults";

export function SearchResults() {
    const { searchResultsVisibility, searchResults } = useContext(SearchContext);
    return (
        <div className={`h-full flex flex-col ${searchResultsVisibility ? "block" : "hidden"}`}>
            <SearchResultsNavBar/>
            <div className="h-1 overflow-y-scroll flex-grow">
                <ScheduleResults courses={searchResults}/>
            </div>
        </div>
    )
}