import { SortingOptions, FilteringOptions } from "../../../app/pages/SearchResults";
import { Course } from "../../../constants/Types";
import { filterSectionTypes, filterStatus, filterDays, filterRestrictions } from "../../../utils/FilteringFunctions";
import { sortOfferingsByGPA, sortOfferingsByRMP, sortInstructorsByRMP, sortCoursesByGPA, sortCoursesByRMP, sortCoursesByName } from "../../../utils/SortingFunctions";
import { CourseResult } from "./CourseResult";

/**
 * Component for displaying a list of Course results in a table.
 */
export function ScheduleResults(props: {sortingOptions: SortingOptions, filteringOptions: FilteringOptions, courses: Course[]}) {
    const {sortBy, direction, sortWithin} = props.sortingOptions;
    const {sectionTypes, statusTypes, dayTypes, restrictionTypes} = props.filteringOptions;

    const defaultGpa = direction === "Ascending" ? 5 : -1;
    const defaultRmp = direction === "Ascending" ? 6 : -1;

    // Create a new array of new courses that are filtered and sorted.
    const courses = props.courses.map(course => {
        const newCourse = Object.assign({}, course);

        // Filter course offerings.
        newCourse.offerings = newCourse.offerings
            .filter(filterSectionTypes(sectionTypes))
            .filter(filterStatus(statusTypes))
            .filter(filterDays(dayTypes))
            .filter(filterRestrictions(restrictionTypes));

        // Sort offerings if necessary.
        if (sortWithin) {
            newCourse.offerings = newCourse.offerings.sort(
                // Sort with appropriate sorting function for course offerings.
                (function getSortingFunction() {
                    switch(sortBy) {
                        case "GPA": return sortOfferingsByGPA(defaultGpa);
                        case "RMP": return sortOfferingsByRMP(defaultRmp);
                        default: return () => 0;
                    }
                })()
            );

            // Reverse array of offerings if necessary.
            if (direction === "Descending") {
                newCourse.offerings.reverse();
            }

            // Sort instructors if necessary.
            if (sortBy === "RMP") {
                newCourse.offerings.forEach(offering => {
                    offering.instructors = offering.instructors.sort(sortInstructorsByRMP(defaultRmp));

                    // Reverse array of offerings if necessary.
                    if (direction === "Descending") {
                        offering.instructors.reverse();
                    }
                });
            }
        }
        return newCourse;
    }).filter(
        // Filter out courses that have no offerings.
        ({offerings}) => offerings.length
    ).sort(
        // Sort with appropriate sorting function for courses.
        (function getSortingFunction() {
            switch(sortBy) {
                case "GPA": return sortCoursesByGPA(defaultGpa);
                case "RMP": return sortCoursesByRMP(defaultRmp);
                default: return sortCoursesByName;
            }
        })()
    );

    // Reverse array of courses if necessary.
    if (direction === "Descending") {
        courses.reverse();
    }
    
    return (
        <table className="h-0 table-fixed text-center overflow-x-scroll min-w-full border-spacing-0 border-separate rounded">
            {courses.map(course => <CourseResult key={course.id} course={course}/>)}
        </table>
    )
}