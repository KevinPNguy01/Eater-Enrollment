import { ScheduleResults } from "../../features/results/components/ScheduleResult"
import { FilterMenu } from "../../features/refining/components/FilteringMenu"
import { SortingMenu } from "../../features/refining/components/SortingMenu"
import { FilterOptions, SortBy, SortDirection, SortOptions } from "../../features/refining/types/options"
import { filterCourses, newFilterOptions, sortCourses } from "../../features/refining/utils"
import { statusColors } from "../../constants/TextColors"
import { restrictionCodes } from "../../constants/RestrictionCodes"
import { Course } from "../../constants/Types"
import { useState, useEffect } from "react"

export function SearchResults(props: {courses: Course[], submitSearch: () => void, resetSearch: () => void, backSearch: () => void, forwardSearch: () => void}) {
    const {courses, submitSearch, resetSearch, backSearch, forwardSearch} = props;
    const [sortOptions, setSortOptions] = useState({
        sortBy: SortBy.Name,
        direction: SortDirection.Ascending,
        sortWithin: false,
    } as SortOptions);
    const [filterOptions, setFilterOptions] = useState(null as unknown as FilterOptions);

    // Reset filters when courses change.
    useEffect(() => setFilterOptions(newFilterOptions()), [courses]);

    // Default filter options only include values found in courses.
    const defaultFilterOptions = {
        sectionTypes: new Set(courses.map(({offerings}) => offerings.map(({section}) => section.type)).flat()),
        statusTypes: new Set(statusColors.keys()),
        dayTypes: new Set(["M", "Tu", "W", "Th", "F"]),
        restrictionTypes: new Set(
            courses.map(
                ({offerings}) => offerings.map(
                    ({restrictions}) => restrictions.replace("or", "and").split(" and ")
                ).flat()
            ).flat().filter(s => s).map(
                code => `${code}: ${restrictionCodes.get(code)}`
            )
        )
    };

    // Filter courses if the filter options have been defined. Always sort.
    const filteredCourses = filterOptions ? filterCourses(courses, filterOptions) : courses;
    sortCourses(filteredCourses, sortOptions);

    return (
        <div className={`h-full flex flex-col`}>
            <SearchResultsNavBar sortOptionsState={[sortOptions, setSortOptions]} filterOptionsState={[filterOptions, setFilterOptions]} defaultFilterOptions={defaultFilterOptions} submitSearch={submitSearch} resetSearch={resetSearch} backSearch={backSearch} forwardSearch={forwardSearch}/>
            {filteredCourses.length ? <ScheduleResults courses={filteredCourses}/> : <LoadingSymbol/>}
        </div>
    ) 
}

function SearchResultsNavBar(props: {sortOptionsState: [SortOptions, (options: SortOptions) => void], filterOptionsState: [FilterOptions, (options: FilterOptions) => void], defaultFilterOptions: FilterOptions, submitSearch: () => void, resetSearch: () => void, backSearch: () => void, forwardSearch: () => void}) {
    const {submitSearch, resetSearch, backSearch, forwardSearch} = props;
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [filterMenuVisible, setFilterMenuVisible] = useState(false);

    // Click event handlers.
    const clickSortMenu = () => setSortMenuVisible(!sortMenuVisible);
    const clickFilterMenu = () => setFilterMenuVisible(!filterMenuVisible);

    const buttonStyle = "mr-4 hover:bg-tertiary rounded-full w-fit aspect-square";
    return (
        <nav className="relative flex bg-secondary border border-quaternary p-1 mb-4 rounded text-2xl whitespace-pre text-center items-center">
            <button className={buttonStyle} onClick={resetSearch}>{" 🏠︎ "}</button>
            <button className={buttonStyle} onClick={backSearch}>{" ← "}</button>
            <button className={buttonStyle} onClick={forwardSearch}>{" → "}</button>
            <button className={buttonStyle} onClick={() => submitSearch()}>{" ↻ "}</button>
            <div>
                <button className={buttonStyle} onClick={clickSortMenu}>{" ⇅ "}</button>
                {sortMenuVisible ? <SortingMenu optionsState={props.sortOptionsState}/> : null}
            </div>
            <div>
                <button className={buttonStyle} onClick={clickFilterMenu}>{" ⚙ "}</button>
                {filterMenuVisible ? <FilterMenu optionsState={props.filterOptionsState} defaultOptions={props.defaultFilterOptions}/> : null}
            </div>
        </nav>
    )
} 

function LoadingSymbol() {
    return (
        <div role="status" className="w-full h-3/4 justify-center content-center">
            <svg aria-hidden="true" className="w-1/6 block m-auto text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
        </div>
    )
}