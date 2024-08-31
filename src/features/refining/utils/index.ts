import { restrictionCodes } from "../../../constants/RestrictionCodes";
import { statusColors, typeColors } from "../../../constants/TextColors";
import { Course } from "../../../types/Course";
import { FilterOptions, SortBy, SortDirection, SortOptions } from "../types/options";
import { filterDays, filterLevel, filterRestrictions, filterSectionTypes, filterStatus, filterTime } from "./FilterFunctions";
import { sortOfferingsByGPA, sortOfferingsByRMP, sortInstructorsByRMP, sortCoursesByGPA, sortCoursesByName, sortCoursesByRMP } from "./SortFunctions";

/**
 * @param courses The courses to filter.
 * @param filterOptions An object containing the options to filter by.
 * @returns A new array of filtered courses.
 */
export function filterCourses(courses: Course[], filterOptions: FilterOptions) {
    const {sectionTypes, statusTypes, dayTypes, restrictionTypes, levelTypes, timeRange} = filterOptions;
    const filteredCourses = courses.map(course => ({...course}))
        .filter(filterLevel(levelTypes));

    // Filter offerings of each course by options specified.
    filteredCourses.forEach(course => 
        course.offerings = course.offerings
            .filter(filterSectionTypes(sectionTypes))
            .filter(filterStatus(statusTypes))
            .filter(filterDays(dayTypes))
            .filter(filterTime(timeRange))
            .filter(filterRestrictions(restrictionTypes))
    );
    return filteredCourses.filter(({offerings}) => offerings.length);
}

/**
 * @param courses The courses to sort.
 * @param sortOptions An object containg the options to sort by.
 * Sorts the array of courses in place.
 */
export function sortCourses(courses: Course[], sortOptions: SortOptions) {
    const {GPA, RMP} = SortBy;
    const {Ascending, Descending} = SortDirection;
    const {sortBy, direction, sortWithin} = sortOptions;
    const defaultGpa = direction === Ascending ? 5 : -1;
    const defaultRmp = direction === Ascending ? 6 : -1;

    // Sort courses with appropriate sorting function.
    courses.sort(
        (() => {
            switch(sortBy) {
                case GPA: return sortCoursesByGPA(defaultGpa);
                case RMP: return sortCoursesByRMP(defaultRmp);
                default: return sortCoursesByName;
            }
        })()
    );
    if (direction === Descending) courses.reverse();
    if (!sortWithin) return;
    
    // Sort offerings if necessary.
    courses.forEach(({offerings}) => {
        // Sort course offerings with appropriate sorting function.
        offerings.sort(
            (() => {
                switch(sortBy) {
                    case GPA: return sortOfferingsByGPA(defaultGpa);
                    case RMP: return sortOfferingsByRMP(defaultRmp);
                    default: return () => 0;
                }
            })()
        );
        if (direction === Descending) offerings.reverse();
        if (sortBy !== RMP) return;

        // Sort instructors if necessary.
        offerings.forEach(({instructors}) => {
            instructors.sort(sortInstructorsByRMP(defaultRmp))
            if (direction === Descending) instructors.reverse()
        });
    });
}

/**
 * @returns A new default FilterOptions object.
 */
export function newFilterOptions() {
    return {
        sectionTypes: new Set(typeColors.keys()),
        statusTypes: new Set(statusColors.keys()),
        dayTypes: new Set(["M", "Tu", "W", "Th", "F"]),
        restrictionTypes: new Set([...restrictionCodes.keys()].map(code => `${code}: ${restrictionCodes.get(code)}`)),
        levelTypes: new Set(["Lower Division", "Upper Division", "Graduate"]),
        timeRange: [480, 1320]
    } as FilterOptions;
}