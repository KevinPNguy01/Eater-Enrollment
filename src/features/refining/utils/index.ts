import { restrictionCodes } from "constants/RestrictionCodes";
import { statusColors, typeColors } from "constants/TextColors";
import { Course } from "types/Course";
import { FilterOptions, SortBy, SortDirection, SortOptions } from "../types/options";
import { filterDays, filterLevel, filterRestrictions, filterSectionTypes, filterStatus, filterTime } from "./FilterFunctions";
import { sortCoursesByGPA, sortCoursesByName, sortCoursesByRMP, sortInstructorsByRMP, sortOfferingsByGPA, sortOfferingsByRMP } from "./SortFunctions";
import { GradeDistributionCollection } from "types/GradeDistributionCollection";
import { Review } from "types/Review";

/**
 * @param courses The courses to filter.
 * @param filterOptions An object containing the options to filter by.
 * @returns A new array of filtered courses.
 */
export function filterCourses(courses: Course[], filterOptions: FilterOptions) {
    const { sectionTypes, statusTypes, dayTypes, restrictionTypes, levelTypes, timeRange } = filterOptions;
    const filteredCourses = courses.map(course => ({ ...course, offerings: course.offerings.map(offering => ({ ...offering })) }))
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
    return filteredCourses.filter(({ offerings }) => offerings.length);
}

/**
 * @param courses The courses to sort.
 * @param sortOptions An object containg the options to sort by.
 * @param grades A Record of course ids to Records of instructor names to GradeDistributionCollections.
 * @param reviews A record of instructor names to Reviews.
 * Sorts the array of courses in place.
 */
export function sortCourses(courses: Course[], sortOptions: SortOptions, grades: Record<string, Record<string, GradeDistributionCollection>>, reviews: Record<string, Review>) {
    const { GPA, RMP } = SortBy;
    const { Ascending, Descending } = SortDirection;
    const { sortBy, direction, sortWithin } = sortOptions;
    const defaultGpa = direction === Ascending ? 5 : -1;
    const defaultRmp = direction === Ascending ? 6 : -1;

    // Sort courses with appropriate sorting function.
    const sortedCourses = courses.toSorted(
        (() => {
            switch (sortBy) {
                case GPA: return sortCoursesByGPA(defaultGpa, grades);
                case RMP: return sortCoursesByRMP(defaultRmp, reviews);
                default: return sortCoursesByName;
            }
        })()
    );
    if (direction === Descending) sortedCourses.reverse();
    if (!sortWithin) return sortedCourses;

    // Sort offerings if necessary.
    sortedCourses.forEach(course => {
        // Sort course offerings with appropriate sorting function.
        course.offerings = course.offerings.toSorted(
            (() => {
                switch (sortBy) {
                    case GPA: return sortOfferingsByGPA(defaultGpa, grades);
                    case RMP: return sortOfferingsByRMP(defaultRmp, reviews);
                    default: return () => 0;
                }
            })()
        );
        if (direction === Descending) course.offerings.reverse();
        if (sortBy !== RMP) return;

        // Sort instructors if necessary.
        course.offerings.forEach(offering => {
            offering.instructors = offering.instructors.toSorted(sortInstructorsByRMP(defaultRmp, reviews))
            if (direction === Descending) offering.instructors = offering.instructors.toReversed()
        });
    });
    return sortedCourses;
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
        timeRange: [480, 1440]
    } as FilterOptions;
}

/**
 * @param courses 
 * @returns Default filter options for the given courses.
 */
export function defaultFilterOptions(courses: Course[]) {
    return {
        ...newFilterOptions(),
        sectionTypes: new Set(courses.map(({ offerings }) => offerings.map(({ section }) => section.type)).flat()),
        restrictionTypes: new Set(
            courses.map(
                ({ offerings }) => offerings.map(
                    ({ restrictions }) => restrictions.replace("or", "and").split(" and ")
                ).flat()
            ).flat().filter(s => s).map(
                code => `${code}: ${restrictionCodes.get(code)}`
            )
        )
    }
}