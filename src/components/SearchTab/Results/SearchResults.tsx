import { SearchResultsNavBar, SearchContext } from "../.."
import { useContext, useState } from "react";
import { ScheduleResults } from "./ScheduleResult";

export type SortingOptions = {
    sortBy: string
    setSortBy: (_: string) => void
    direction: string
    setDirection: (_: string) => void
}

export function SearchResults(props: {callBack: () => void}) {
    const { searchResultsVisibility, searchResults } = useContext(SearchContext);
    const [sortBy, setSortBy] = useState("Name");
    const [direction, setDirection] = useState("Ascending");
    const sortingOptions = {
        sortBy: sortBy,
        setSortBy: setSortBy,
        direction: direction,
        setDirection: setDirection
    }
    return (
        <div className={`h-full flex flex-col ${searchResultsVisibility ? "block" : "hidden"}`}>
            <SearchResultsNavBar sortingOptions={sortingOptions} callBack={props.callBack}/>
            <div className="h-1 overflow-y-scroll flex-grow">
                <ScheduleResults sortingOptions={sortingOptions} courses={searchResults}/>
            </div>
        </div>
    )
}