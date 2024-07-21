import { ScheduleResults } from "../../features/results/components/ScheduleResult"
import { FilterMenu } from "../../features/refining/components/FilteringMenu"
import { SortingMenu } from "../../features/refining/components/SortingMenu"
import { FilterOptions, SortBy, SortDirection, SortOptions } from "../../features/refining/types/options"
import { filterCourses, newFilterOptions, sortCourses } from "../../features/refining/utils"
import { restrictionCodes } from "../../constants/RestrictionCodes"
import { Course } from "../../constants/Types"
import { useState, useEffect } from "react"
import { SearchFunctions } from "./CoursesPane"
import { Query } from "../../utils/PeterPortal"
import { SearchBox } from "../../features/search/components/SearchBox"
import { IconButton } from "@mui/material"

const homeIcon = <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 16 16">
    <path stroke="#ddd" stroke-width="0.5" fill="#ddd" d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
</svg>;

const leftArrowIcon = <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 16 16">
    <path stroke="#ddd" stroke-width="0.5" fill="#ddd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
</svg>;

const rightArrowIcon = <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16">
    <path stroke="#ddd" stroke-width="0.5" fill="#ddd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
</svg>;

const refreshIcon = <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" transform="rotate(45)">
    <path stroke="#ddd" stroke-width="0.5" fill="#ddd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
    <path stroke="#ddd" stroke-width="0.5" fill="#ddd" d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
</svg>;

const sortIcon = <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16">
    <path stroke="#ddd" stroke-width="0.5" fill="#ddd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5"/>
</svg>;

const filterIcon = <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16">
    <path stroke="#ddd" stroke-width="0.5" fill="#ddd" d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z"/>
</svg>;

export function SearchResults(props: {
    courses: Course[], 
    multiState: [boolean, (_: boolean) => void]
    queriesState: [Query[], (_: Query[]) => void], 
    defaultQuery: Query, 
    lastQueries: Query[],
    searchFunctions: SearchFunctions}
) {
    const {courses, queriesState, defaultQuery, lastQueries, searchFunctions} = props;
    const [sortOptions, setSortOptions] = useState({
        sortBy: SortBy.Name,
        direction: SortDirection.Ascending,
        sortWithin: false,
    } as SortOptions);
    const [filterOptions, setFilterOptions] = useState(null as unknown as FilterOptions);

    // Default filter options only include section and restriction types found in courses.
    const defaultFilterOptions = {
        ...newFilterOptions(),
        sectionTypes: new Set(courses.map(({offerings}) => offerings.map(({section}) => section.type)).flat()),
        restrictionTypes: new Set(
            courses.map(
                ({offerings}) => offerings.map(
                    ({restrictions}) => restrictions.replace("or", "and").split(" and ")
                ).flat()
            ).flat().filter(s => s).map(
                code => `${code}: ${restrictionCodes.get(code)}`
            )
        )
    } as FilterOptions;

    // Reset filters when courses change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setFilterOptions({...defaultFilterOptions}), [courses]);

    // Filter courses if the filter options have been defined. Always sort.
    const filteredCourses = filterOptions ? filterCourses(courses, filterOptions) : courses;
    sortCourses(filteredCourses, sortOptions);

    return (
        <div className={`h-full flex flex-col`}>
            <SearchResultsNavBar 
                sortOptionsState={[sortOptions, setSortOptions]} 
                filterOptionsState={[filterOptions, setFilterOptions]} 
                defaultFilterOptions={defaultFilterOptions} 
                searchFunctions={searchFunctions}
                queriesState={queriesState}
                multiState={props.multiState}
                defaultQuery={defaultQuery}
                lastQueries={lastQueries}
            />
            {filteredCourses.length ? <ScheduleResults courses={filteredCourses}/> : <LoadingSymbol/>}
        </div>
    ) 
}

function SearchResultsNavBar(props: {
    sortOptionsState: [SortOptions, (options: SortOptions) => void], 
    filterOptionsState: [FilterOptions, (options: FilterOptions) => void], 
    defaultFilterOptions: FilterOptions, 
    searchFunctions: SearchFunctions,
    queriesState: [Query[], (_: Query[]) => void],
    defaultQuery: Query,
    multiState: [boolean, (_: boolean) => void],
    lastQueries: Query[]}
) {
    const {queriesState, multiState, defaultQuery, lastQueries} = props;
    const {submitSearch, resetSearch, backSearch, forwardSearch, refreshSearch} = props.searchFunctions;
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [filterMenuVisible, setFilterMenuVisible] = useState(false);

    // Click event handlers.
    const clickSortMenu = () => setSortMenuVisible(!sortMenuVisible);
    const clickFilterMenu = () => setFilterMenuVisible(!filterMenuVisible);

    return (
        <nav className="relative flex bg-tertiary border border-quaternary px-2 py-1 mb-4 rounded whitespace-pre text-center content-center items-center gap-1">
            <IconButton color="info" onClick={backSearch}>{leftArrowIcon}</IconButton>
            <IconButton color="info" onClick={forwardSearch}>{rightArrowIcon}</IconButton>
            <IconButton color="info" onClick={refreshSearch}>{refreshIcon}</IconButton>
            <IconButton color="info" onClick={resetSearch}>{homeIcon}</IconButton>
            <div className="flex-grow w-0">
                <SearchBox multiState={multiState} queriesState={queriesState} defaultQuery={defaultQuery} lastQueries={lastQueries} submitQueries={submitSearch}/>
            </div>
            <div className="flex">
                <IconButton color="info" onClick={clickSortMenu}>{sortIcon}</IconButton>
                {sortMenuVisible ? <SortingMenu optionsState={props.sortOptionsState}/> : null}
            </div>
            <div className="flex">
                <IconButton color="info" onClick={clickFilterMenu}>{filterIcon}</IconButton>
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