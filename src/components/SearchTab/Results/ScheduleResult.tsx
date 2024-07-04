import { Course, CourseOffering } from '../../../constants/Types'
import { CourseResult } from './CourseResult'
import { FilteringOptions, SortingOptions } from './SearchResults'

/**
 * Component for displaying a list of Course results in a table.
 */
export function ScheduleResults(props: {sortingOptions: SortingOptions, filteringOptions: FilteringOptions, courses: Course[]}) {
    const {sortBy, direction} = props.sortingOptions;
    const {sectionTypes, statusTypes, dayTypes} = props.filteringOptions;

    const sortByName = (a: Course, b: Course) => {
        if (a.department < b.department) {
            return -1;
        } else if (b.department < a.department) {
            return 1;
        } else {
            const numberA = a.number.replace(/[a-z]+/ig, '');
            const numberB = b.number.replace(/[a-z]+/ig, '');
            if (numberA.length < numberB.length) {
                return -1;
            } else if (numberB.length < numberA.length) {
                return 1;
            } else {
                if (numberA < numberB) {
                    return -1;
                } else if (numberB < numberA) {
                    return  1;
                } else {
                    const identifierA = a.number.replace(/[0-9]/g, '');
                    const identifierB = b.number.replace(/[0-9]/g, '');
                    return identifierA < identifierB ? -1 : 1;
                }
            }
        }
    }

    const sortByGPA = (a: Course, b: Course) => {
        const minOrMax = direction === "Ascending" ? Math.min : Math.max;
        const defaultGpa = direction === "Ascending" ? 5 : -1;
        const getGpa = (course: Course) => minOrMax(...course.offerings.map(({grades}) => grades?.aggregate?.average_gpa || defaultGpa));
        const gpaA = getGpa(a);
        const gpaB = getGpa(b);
        if (gpaA < gpaB) {
            return -1;
        } else if (gpaB < gpaA) {
            return 1;
        } else {
            return (direction === "Ascending" ? 1 : -1) * sortByName(a, b);
        }
    }

    const sortByRMP = (a: Course, b: Course) => {
        const minOrMax = direction === "Ascending" ? Math.min : Math.max;
        const defaultRmp = direction === "Ascending" ? 6 : -1;
        const getRmp = (course: Course) => minOrMax(...course.offerings.map(({instructors}) => instructors.map(({review}) => review?.avgRating || defaultRmp)).flat());
        const rmpA = getRmp(a);
        const rmpB = getRmp(b);
        if (rmpA < rmpB) {
            return -1;
        } else if (rmpB < rmpA) {
            return 1;
        } else {
            return (direction === "Ascending" ? 1 : -1) * sortByName(a, b);
        }
    }

    const filterSectionType = (offering: CourseOffering) => {
        return sectionTypes.has(offering.section.type);
    };

    const filterStatus = (offering: CourseOffering) => {
        return statusTypes.has(offering.status);
    };

    const filterDays = (offering: CourseOffering) => {
        let days = offering.meetings[0].days;
        dayTypes.forEach(day => days = days.replace(day, ""));
        return days === "";
    }

    const courses = props.courses.map(course => {
        const newCourse = Object.assign({}, course);
        newCourse.offerings = newCourse.offerings.filter(filterSectionType).filter(filterStatus).filter(filterDays);
        return newCourse;
    }).filter(({offerings}) => offerings.length).sort(sortBy === "Name" ? sortByName : (sortBy === "GPA" ? sortByGPA : sortByRMP));
    if (direction === "Descending") {
        courses.reverse();
    }
    return (
        <table className="h-0 table-fixed text-center overflow-x-scroll min-w-full border-spacing-0 border-separate rounded">
            {courses.map(course => <CourseResult key={course.id} course={course}/>)}
        </table>
    )
}