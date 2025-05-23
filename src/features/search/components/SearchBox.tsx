import { requestGrades, requestSchedule } from "api/AnteaterAPI";
import { AppDispatch } from "app/store";
import { Tooltip } from "components/Tooltip";
import { groupOfferings } from "helpers/CourseOffering";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectGrades } from "stores/selectors/Grades";
import { selectReviews } from "stores/selectors/Reviews";
import { selectScheduleQueries, selectSearchInput, selectSearchQuarter, selectSearchSuggestions, selectSearchType, selectSearchYear } from "stores/selectors/Search";
import { addCourseGrades } from "stores/slices/Grades";
import { addInstructorReview } from "stores/slices/Reviews";
import { addQuery, clearQueries, removeQuery, setDisplayResults, setSearchFulfilled, setSearchInput, setSearchPending, setSearchSuggestions, toggleSearchType } from "stores/slices/Search";
import { searchProfessor } from "utils/RateMyProfessors";
import { getSuggestions } from "../utils/FormHelpers";
import { QueryBubble } from "./QueryBubble";
import { SearchList } from "./SearchList";
import { SvgIcon } from "@mui/material";
import useWindowDimensions from "utils/WindowDimensions";

const searchIcon = (
    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 26 26">
        <path fill="#bbb" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
);
const multiSearchIcon = (
    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 26 26">
        <path fill="#bbb" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        <path stroke="#bbb" strokeWidth="2" transform="translate(12, -3) scale(0.5)" d="M6 12h12M12 6v12" />
    </svg>
);

export function SearchBox() {
    const [focus, setFocus] = useState(false);
    const [scrollFade, setScrollFade] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const dispatch = useDispatch<AppDispatch>();
    const searchQueries = useSelector(selectScheduleQueries);
    const searchType = useSelector(selectSearchType);
    const quarter = useSelector(selectSearchQuarter);
    const year = useSelector(selectSearchYear);
    const input = useSelector(selectSearchInput);
    const allGrades = useSelector(selectGrades);
    const allReviews = useSelector(selectReviews);

    const {height, width} = useWindowDimensions();

    const toggleSearchTypeHandler = useCallback(() => {
        dispatch(toggleSearchType());
        // If state is now single-search, there are queries, and the user isn't typing
        if (searchType === "multi" && searchQueries.length && !input.length) {
            const query = searchQueries[searchQueries.length - 1]
            const { ge, department, number } = query;
            const text = ge ? ge : department + (number ? ` ${number}` : "");
            dispatch(setSearchInput(text));
            dispatch(clearQueries());
        }
    }, [dispatch, input.length, searchQueries, searchType]);

    const inputRef = useRef<HTMLInputElement>(null);

    const searchSuggestions = useSelector(selectSearchSuggestions);
    useEffect(() => { dispatch(setSearchSuggestions(getSuggestions(input))) }, [dispatch, input]);

    const listRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: TouchEvent) => {
            e.preventDefault();
        }
        const list = listRef.current;
        if (list) {
            list.addEventListener("touchstart", handler)
            return () => {
                list!.removeEventListener("touchstart", handler)
            }
        }
    }, [listRef, searchSuggestions])

    const searchToggleRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: TouchEvent | MouseEvent) => {
            e.preventDefault();
            toggleSearchTypeHandler();
        }
        const searchToggle = searchToggleRef.current;
        if (searchToggle) {
            searchToggle.addEventListener("touchstart", handler)
            searchToggle.addEventListener("mousedown", handler)
            return () => {
                searchToggle.removeEventListener("touchstart", handler)
                searchToggle.removeEventListener("mousedown", handler)
            }
        }
    }, [listRef, searchSuggestions, toggleSearchTypeHandler])

    const keyHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        // If the user presses enter
        if (searchType === "single") {
            if (searchSuggestions.length) {           // Add the first search suggestion and clear the search box.
                e.currentTarget.blur();
                dispatch(setDisplayResults(true));
                const queries = [{ ...searchSuggestions[0].value, quarter, year }];
                dispatch(setSearchPending());
                const offerings = await requestSchedule(queries);
                const courses = groupOfferings(offerings);
                dispatch(setSearchFulfilled({ queries, courses, refresh: false }))

                const grades = await requestGrades(courses.filter(({ department, number }) => !allGrades[`${department} ${number}`]));
                Object.keys(grades).forEach(courseName => dispatch(addCourseGrades({ courseName, grades: grades[courseName] })))

                const instructors = [...new Set(offerings.map(
                    ({ instructors }) => instructors.map(
                        ({ shortened_name }) => shortened_name
                    )
                ).flat(4).filter(instructor => instructor !== "STAFF" && !(instructor in allReviews)))];

                for (const instructor of instructors) {
                    const review = await searchProfessor(instructor);
                    dispatch(addInstructorReview({ instructor, review }));
                }
            } else {
                (document.activeElement as HTMLElement)?.blur();
            }
        } else {
            if (searchSuggestions.length) {           // Add the first search suggestion and clear the search box.
                dispatch(addQuery({ ...searchSuggestions[0].value, quarter, year }));
            } else if (!input.length && searchQueries.length) {     // Submit search if the box is empty.
                e.currentTarget.blur();
                dispatch(setSearchPending());
                const offerings = await requestSchedule(searchQueries);
                const courses = groupOfferings(offerings);
                dispatch(setSearchFulfilled({ queries: searchQueries, courses, refresh: false }))

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
            }
        }
    }

    // Update scroll position when the number of queries changes, or if toggling multi-search.
    useEffect(() => {
        const { current } = scrollRef;
        if (current) {
            current.scrollLeft = current.scrollWidth;
            setScrollFade(current.scrollWidth !== current.clientWidth);
        }
    }, [searchQueries, searchType]);

    return (
        <div
            className={`w-full relative h-fit bg-secondary flex px-2 items-center border-quaternary border ${searchSuggestions.length && focus ? "rounded-t-[1.125rem] border-b-0" : "rounded-[1.125rem]"}`}
        >
            {/** Magnifying glass icon to toggle mutli-search. */}
            <div ref={searchToggleRef} id="toggle-multi-search" className="relative group hover:cursor-pointer">
                <SvgIcon fontSize={width >= height ? "medium" : "small"}>
                    {searchType === "multi" ? multiSearchIcon : searchIcon}
                </SvgIcon>
                <Tooltip className="select-none left-1/2 -translate-x-1/2 text-nowrap text-xs mt-1 bg-tertiary border border-neutral-500 p-1.5 text-neutral-300 hidden group-hover:block" text="Toggle multi-search" />
            </div>

            <div
                className={`flex flex-grow gap-2 md:py-1 overflow-x-scroll hide-scroll`}
                style={{ maskImage: scrollFade ? "linear-gradient(to left, black 90%, transparent 100%)" : "" }}
                ref={scrollRef}
                onScroll={(e) => {
                    setScrollFade((searchQueries.length !== 0) && (e.currentTarget.scrollLeft !== 0));
                }}
            >
                {/** Query bubbles */}
                {searchType === "multi" ? searchQueries.map((query, index) => <QueryBubble key={index} query={query} onClick={() => dispatch(removeQuery(index))} />) : null}

                {/** Generate search suggestions as the user types. */}
                <input
                    ref={inputRef}
                    className="m-1 h-1/2 min-w-[75%] flex-grow border-0"
                    placeholder="Search"
                    type="text"
                    value={input}
                    onChange={({ target }) => {
                        dispatch(setSearchInput(target.value));
                    }}
                    onKeyDown={keyHandler}
                    onFocus={() => setFocus(true)}
                    onBlur={e => {
                        searchType === "multi" && e.relatedTarget?.classList.contains("search-suggestion") ? inputRef.current?.focus() : setFocus(false);
                    }}
                />
            </div>


            {/** Show X button to clear search box if there is anything in it. */}
            {input || searchQueries.length ? (
                <div>
                    <SvgIcon fontSize={width >= height ? "medium" : "small"}>
                        <svg
                            className="hover:cursor-pointer"
                            focusable="false"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 26 26"
                            onMouseDown={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                dispatch(setSearchInput(""));
                                dispatch(clearQueries());
                            }}
                            onTouchEnd={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                dispatch(setSearchInput(""));
                                dispatch(clearQueries());
                            }}
                        >
                            <path fill="#bbb" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </SvgIcon>
                </div>
            ) : null}
            {focus && searchSuggestions.length > 0 && (
                <div ref={listRef}>
                    <SearchList suggestions={searchSuggestions} />
                </div>
            )}
        </div>
    );
}