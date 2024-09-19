import EastIcon from '@mui/icons-material/East'
import WestIcon from '@mui/icons-material/West'
import IconButton from "@mui/material/IconButton"
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import { requestGrades, requestSchedule } from 'api/PeterPortalGraphQL'
import { AppDispatch } from "app/store"
import { filterIcon, sortIcon } from 'assets/icons'
import { FilterMenu } from "features/refining/components/FilteringMenu"
import { SortingMenu } from "features/refining/components/SortingMenu"
import { defaultSortOptions, FilterOptions, SortOptions } from "features/refining/types/options"
import { defaultFilterOptions, filterCourses, sortCourses } from "features/refining/utils"
import { ScheduleResults } from "features/results/components/ScheduleResult"
import { SearchBox } from "features/search/components/SearchBox"
import { groupOfferings } from 'helpers/CourseOffering'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { selectGrades } from 'stores/selectors/Grades'
import { selectFutureSearch, selectPastSearch, selectPrevQueries, selectSearchPending, selectSearchResults } from "stores/selectors/Search"
import { addCourseGrades } from 'stores/slices/Grades'
import { clearQueries, setDisplayResults, setSearchFulfilled, setSearchInput, setSearchPending } from "stores/slices/Search"
import { addInstructorReview } from 'stores/slices/Reviews';
import { searchProfessor } from 'utils/RateMyProfessors';
import { selectReviews } from 'stores/selectors/Reviews';
import useWindowDimensions from 'utils/WindowDimensions';

export function SearchResults() {
    const searchResults = useSelector(selectSearchResults);
    const pending = useSelector(selectSearchPending);
    const allGrades = useSelector(selectGrades);
    const allReviews = useSelector(selectReviews);

    const [sortOptions, setSortOptions] = useState(defaultSortOptions);
    const [filterOptions, setFilterOptions] = useState(null as unknown as FilterOptions);
    const [defaultFilter, setDefaultFilter] = useState(null as unknown as FilterOptions);

    // Reset filters when courses change.
    useEffect(() => {
        setFilterOptions(defaultFilterOptions(searchResults));
        setDefaultFilter(defaultFilterOptions(searchResults));
    }, [searchResults]);

    // Filter courses if the filter options have been defined. Always sort.
    const filteredCourses = filterOptions ? filterCourses(searchResults, filterOptions) : searchResults;
    const sortedCourses = sortCourses(filteredCourses, sortOptions, allGrades, allReviews);

    return (
        <div className={`relative h-full flex flex-col`}>
            <SearchResultsNavBar
                sortOptionsState={[sortOptions, setSortOptions]}
                filterOptionsState={[filterOptions, setFilterOptions]}
                defaultFilterOptions={defaultFilter}
            />
            {pending ? <LoadingSymbol /> : searchResults.length ? <ScheduleResults courses={sortedCourses} /> : "No results found."}
        </div>
    )
}

function SearchResultsNavBar(props: {
    sortOptionsState: [SortOptions, (options: SortOptions) => void],
    filterOptionsState: [FilterOptions, (options: FilterOptions) => void],
    defaultFilterOptions: FilterOptions,
}
) {
    const { sortOptionsState, filterOptionsState, defaultFilterOptions } = props;
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [filterMenuVisible, setFilterMenuVisible] = useState(false);
    const pastSearch = useSelector(selectPastSearch);
    const futureSearch = useSelector(selectFutureSearch);
    const prevQueries = useSelector(selectPrevQueries);
    const allGrades = useSelector(selectGrades);
    const allReviews = useSelector(selectReviews);
    const pending = useSelector(selectSearchPending);
    const dispatch = useDispatch<AppDispatch>();

    const { height, width } = useWindowDimensions();
    const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) || (width > height && 1.33 * width / 2 < height);
    const [searching, setSearching] = useState(false);

    const buttonClass = `${(isMobile && searching) ? "max-w-0 opacity-0 !p-0" : "max-w-full"}`;

    return (
        <nav className={`flex flex-nowrap bg-tertiary border border-quaternary ${isMobile ? "px-1" : "px-2"} py-1 mb-4 rounded whitespace-pre text-center content-center items-center ${isMobile ? "gap-px" : "gap-1"}`}>
            {/** Undo button. */}
            <IconButton
                className={buttonClass}
                size={isMobile ? "small" : "medium"}
                color="white"
                disabled={!pastSearch || pending}
                onClick={() => dispatch({ type: "search/undo" })}
            >
                <WestIcon />
            </IconButton>
            {/** Redo button. */}
            <IconButton
                className={buttonClass}
                size={isMobile ? "small" : "medium"}
                color="white"
                disabled={!futureSearch || pending}
                onClick={() => dispatch({ type: "search/redo" })}
            >
                <EastIcon />
            </IconButton>
            {/** Refresh button. */}
            <IconButton
                className={buttonClass}
                size={isMobile ? "small" : "medium"}
                color="white"
                disabled={pending}
                onClick={async () => {
                    dispatch(setSearchPending());
                    const offerings = await requestSchedule(prevQueries);
                    const courses = groupOfferings(offerings);
                    dispatch(setSearchFulfilled({ queries: prevQueries, courses, refresh: true }))

                    const grades = await requestGrades(courses.filter(({ department, number }) => !allGrades[`${department} ${number}`]));
                    Object.keys(grades).forEach(courseName => dispatch(addCourseGrades({ courseName, grades: grades[courseName] })));

                    const instructors = [...new Set(offerings.map(
                        ({ instructors }) => instructors.map(
                            ({ shortened_name }) => shortened_name
                        )
                    ).flat(4).filter(instructor => instructor !== "STAFF" && !(instructor in allReviews)))];

                    for (const instructor of instructors) {
                        const review = await searchProfessor(instructor);
                        dispatch(addInstructorReview({ instructor, review }));
                    }
                }}
            >
                <RefreshIcon />
            </IconButton>
            {/** Home button. */}
            <IconButton
                className={buttonClass}
                size={isMobile ? "small" : "medium"}
                color="white"
                disabled={pending}
                onClick={() => {
                    dispatch(setDisplayResults(false));
                    dispatch(clearQueries());
                    dispatch(setSearchInput(""));
                    dispatch({ type: "search/clearHistory" });
                }}
            >
                <HomeIcon />
            </IconButton>
            {/** Search box will expand. */}
            <div
                className={`relative w-0 flex-grow ${isMobile ? "text-sm" : "text-base"}`}
                onTouchStart={() => setSearching(true)}
                onBlur={() => setSearching(false)}
            >
                <SearchBox />
            </div>
            {/** Sort button/menu. */}
            <IconButton
                className={buttonClass}
                size={isMobile ? "small" : "medium"}
                color="white"
                onClick={() => setSortMenuVisible(true)}
            >
                {sortIcon}
            </IconButton>
            {sortMenuVisible && (
                <SortingMenu
                    optionsState={sortOptionsState}
                    close={() => setSortMenuVisible(false)}
                />
            )}
            {/** Filter button/menu. */}
            <IconButton
                className={buttonClass}
                size={isMobile ? "small" : "medium"}
                color="white"
                onClick={() => setFilterMenuVisible(true)}
            >
                {filterIcon}
            </IconButton>
            {filterMenuVisible && (
                <FilterMenu
                    optionsState={filterOptionsState}
                    defaultOptions={defaultFilterOptions}
                    close={() => setFilterMenuVisible(false)}
                />
            )}
        </nav>
    )
}

function LoadingSymbol() {
    return (
        <div role="status" className="w-full h-3/4 justify-center content-center">
            <svg aria-hidden="true" className="w-1/6 block m-auto text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
        </div>
    )
}