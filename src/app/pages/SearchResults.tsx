import { useContext, useState } from "react"
import { restrictionCodes } from "../../constants/RestrictionCodes"
import { typeColors, statusColors } from "../../constants/TextColors"
import { ScheduleResults } from "../../features/results/components/ScheduleResult"
import { FilterMenu } from "../../features/search/components/FilteringMenu"
import { SortMenu } from "../../features/search/components/SortMenu"
import { requestSchedule } from "../../utils/PeterPortal"
import { SearchContext } from "./CoursesPane"

export type SortingOptions = {
    sortBy: string
    setSortBy: (_: string) => void
    direction: string
    setDirection: (_: string) => void
    sortWithin: boolean
    setSortWithin: (_: boolean) => void
}

export type FilteringOptions = {
    sectionTypes: Set<string>
    setSectionTypes: (_: Set<string>) => void
    statusTypes: Set<string>
    setStatusTypes: (_: Set<string>) => void
    dayTypes: Set<string>
    setDayTypes: (_: Set<string>) => void
    restrictionTypes: Set<string>
    setRestrictionTypes: (_: Set<string>) => void
}

export function SearchResults() {
    const {searchResultsVisibility, searchResults} = useContext(SearchContext);
    const [sortBy, setSortBy] = useState("Name");
    const [direction, setDirection] = useState("Ascending");
    const [sortWithin, setSortWithin] = useState(false);
    const sortingOptions = {
        sortBy: sortBy,
        setSortBy: setSortBy,
        direction: direction,
        setDirection: setDirection,
        sortWithin: sortWithin,
        setSortWithin: setSortWithin
    }

    const [sectionTypes, setSectionTypes] = useState(new Set(typeColors.keys()));
    const [statusTypes, setStatusTypes] = useState(new Set(statusColors.keys()));
    const [dayTypes, setDayTypes] = useState(new Set(["M", "Tu", "W", "Th", "F"]));
    const [restrictionTypes, setRestrictionTypes] = useState(new Set(restrictionCodes.keys()));
    const filteringOptions = {
        sectionTypes: sectionTypes,
        setSectionTypes: setSectionTypes,
        statusTypes: statusTypes,
        setStatusTypes: setStatusTypes,
        dayTypes: dayTypes,
        setDayTypes: setDayTypes,
        restrictionTypes: restrictionTypes,
        setRestrictionTypes: setRestrictionTypes
    }

    return (
        <div className={`h-full flex flex-col ${searchResultsVisibility ? "block" : "hidden"}`}>
            <SearchResultsNavBar sortingOptions={sortingOptions} filteringOptions={filteringOptions}/>
            {searchResults.length ? (<div className="h-1 overflow-y-scroll flex-grow">
                <ScheduleResults sortingOptions={sortingOptions} filteringOptions={filteringOptions} courses={searchResults}/>
            </div>) : (
                <div role="status" className="w-full h-3/4 justify-center content-center">
                    <svg aria-hidden="true" className="w-1/6 block m-auto text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                </div>
            )}
        </div>
    ) 
}

function SearchResultsNavBar(props: {sortingOptions: SortingOptions, filteringOptions: FilteringOptions}) {
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [filterMenuVisible, SetFilterMenuVisible] = useState(false);
    const { setSearchResultsVisibility, setSearchResults, setQueries, queries, callBack} = useContext(SearchContext);
    return (
        <nav className="flex bg-secondary border border-quaternary p-1 mb-4 rounded text-2xl whitespace-pre text-center items-center">
            <button className="mr-4 hover:bg-tertiary rounded-full w-fit aspect-square" onClick={() => {
                setSearchResultsVisibility(false);
                setSearchResults([]);
                setQueries([]);
            }}>
                {" ← "}
            </button>
            <button className="mr-4 hover:bg-tertiary rounded-full w-fit aspect-square" onClick={async () => {
                setSearchResults([]);
                const courses = await requestSchedule(queries, callBack);
                setSearchResults(courses);
            }}>
                {" ↻ "}
            </button>
            <div className="relative">
                <button className="mr-4 hover:bg-tertiary rounded-full w-fit aspect-square" onClick={() => {setSortMenuVisible(!sortMenuVisible)}}>
                    {" ⇅ "}
                </button>
                {sortMenuVisible ? <SortMenu sortingOptions={props.sortingOptions}/> : null}
            </div>
            <div className="relative">
                <button className="mr-4 hover:bg-tertiary rounded-full w-fit aspect-square" onClick={() => {SetFilterMenuVisible(!filterMenuVisible)}}>
                    {" ⚙ "}
                </button>
                {filterMenuVisible ? <FilterMenu filteringOptions={props.filteringOptions}/> : null}
            </div>
        </nav>
    )
} 