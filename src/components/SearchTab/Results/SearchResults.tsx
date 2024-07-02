import { SearchResultsNavBar, SearchContext } from "../.."
import { useContext } from "react";
import { ScheduleResults } from "./ScheduleResult";

export function SearchResults(props: {callBack: () => void}) {
    const { searchResultsVisibility, searchResults } = useContext(SearchContext);
    return (
        <div className={`h-full flex flex-col ${searchResultsVisibility ? "block" : "hidden"}`}>
            <SearchResultsNavBar callBack={props.callBack}/>
            <div className="h-1 overflow-y-scroll flex-grow">
                <ScheduleResults courses={searchResults}/>
            </div>
        </div>
    )
}