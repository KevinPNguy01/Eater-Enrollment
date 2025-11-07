import { requestGrades, requestSchedule } from "api/AnteaterAPI";
import { AppDispatch } from "app/store";
import { groupOfferings } from "helpers/CourseOffering";
import { useDispatch, useSelector } from "react-redux";
import { selectGrades } from "stores/selectors/Grades";
import { selectReviews } from "stores/selectors/Reviews";
import { selectSearchQuarter, selectSearchType, selectSearchYear } from "stores/selectors/Search";
import { addCourseGrades } from "stores/slices/Grades";
import { addInstructorReview } from "stores/slices/Reviews";
import { addQuery, setSearchFulfilled, setSearchPending } from "stores/slices/Search";
import { ScheduleQuery } from "types/ScheduleQuery";
import { searchProfessor } from "utils/RateMyProfessors";
import { SearchSuggestion } from "../utils/FormHelpers";
import { useState } from "react";

const departmentIcon = <svg fill="#bbb" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
    <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
</svg>;
const courseIcon = <svg fill="#bbb" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
</svg>
const geIcon = <svg fill="#bbb" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
    <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
</svg>

/**
 * Displays a list of clickable and selectable search suggestions.
 * @param suggestions The array of search suggestions to display.
 * @param appendFunction Called when a search suggestion is selected to add a ScheduleQuery.
 */
export function SearchList(props: { suggestions: SearchSuggestion[] }) {
    const { suggestions } = props;
    const buttonStyle = "flex items-center gap-2 px-4 py-2 text-left border-quaternary hover:bg-tertiary last:rounded-b-[20px] ";
    const dispatch = useDispatch<AppDispatch>();
    const searchType = useSelector(selectSearchType);
    const quarter = useSelector(selectSearchQuarter);
    const year = useSelector(selectSearchYear);
    const allGrades = useSelector(selectGrades);
    const allReviews = useSelector(selectReviews);

    const clickHandler = (query: ScheduleQuery) => async () => {
        if (searchType === "single") {
            (document.activeElement as HTMLElement).blur();
            dispatch(setSearchPending());
            const queries = [{ ...query, year, quarter }];
            const offerings = await requestSchedule(queries);
            const courses = groupOfferings(offerings);
            dispatch(setSearchFulfilled({ queries, courses, refresh: false }))

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
        } else {
            dispatch(addQuery(query));
        }
    }

    const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number }>({ x: -1, y: -1 });

    return (
        <div className="absolute z-10 bg-secondary border-quaternary border border-t-0 -left-[1px] -right-[1px] top-full grid max-h-[50vh] overflow-y-scroll hide-scroll rounded-b-[1.25rem]">
            {suggestions.map(({ text, value }) => {
                const [name, description] = text.split(":")
                const query = { ...value, quarter, year };
                return (
                    <button
                        key={text}
                        className={buttonStyle + "search-suggestion"}
                        onMouseDown={clickHandler(query)}
                        onTouchStart={e => {
                            setTouchStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                        }}
                        onTouchEnd={e => {
                            const touch = e.changedTouches[0];
                            const { x, y } = touchStartPos;
                            const { clientX: x2, clientY: y2 } = touch;
                            const delta = 5;
                            if (Math.abs(x - x2) > delta || Math.abs(y - y2) > delta) return;
                            clickHandler(query)();
                        }}
                    >
                        <div className="ml-0.5 mr-2.5">
                            {(function getIcon() {
                                if (value.ge) return geIcon;
                                if (value.number) return courseIcon;
                                if (value.department) return departmentIcon;
                            })()}
                        </div>
                        <span className="text-wrap">
                            <span className="font-semibold">{name}</span>
                            :{description}
                        </span>
                    </button>
                )
            })}
        </div>
    );
}