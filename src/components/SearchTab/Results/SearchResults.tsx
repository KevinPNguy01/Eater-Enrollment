import { SearchResultsNavBar, SearchContext } from "../.."
import { useContext, useState } from "react";
import { ScheduleResults } from "./ScheduleResult";

export type SortingOptions = {
    sortBy: string
    setSortBy: (_: string) => void
    direction: string
    setDirection: (_: string) => void
}

export type FilteringOptions = {
    sectionTypes: Set<string>
    setSectionTypes: (_: Set<string>) => void
    statusTypes: Set<string>
    setStatusTypes: (_: Set<string>) => void
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

    const [sectionTypes, setSectionTypes] = useState(new Set(["Lec", "Dis", "Lab", "Sem", "Stu", "Tut", "Act", "Res", "Fld", "Col", "Qiz", "Tap"]));
    const [statusTypes, setStatusTypes] = useState(new Set(["OPEN", "NewOnly", "Waitl", "FULL"]));
    const filteringOptions = {
        sectionTypes: sectionTypes,
        setSectionTypes: setSectionTypes,
        statusTypes: statusTypes,
        setStatusTypes: setStatusTypes
    }

    return (
        <div className={`h-full flex flex-col ${searchResultsVisibility ? "block" : "hidden"}`}>
            <SearchResultsNavBar sortingOptions={sortingOptions} filteringOptions={filteringOptions} callBack={props.callBack}/>
            <div className="h-1 overflow-y-scroll flex-grow">
                <ScheduleResults sortingOptions={sortingOptions} filteringOptions={filteringOptions} courses={searchResults}/>
            </div>
        </div>
    )
}