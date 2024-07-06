import { Course, CourseOffering, Instructor } from '../../../constants/Types'
import { CourseResult } from './CourseResult'
import { FilteringOptions, SortingOptions } from './SearchResults'

/**
 * Component for displaying a list of Course results in a table.
 */
export function ScheduleResults(props: {sortingOptions: SortingOptions, filteringOptions: FilteringOptions, courses: Course[]}) {
    const {sortBy, direction, sortWithin} = props.sortingOptions;
    const {sectionTypes, statusTypes, dayTypes, restrictionTypes} = props.filteringOptions;

    const sortCoursesByName = (a: Course, b: Course) => {
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

    const sortOfferingsByGPA = (a: CourseOffering, b: CourseOffering) => {
        const defaultGpa = direction === "Ascending" ? 5 : -1;
        const gpaA = a.grades?.aggregate?.average_gpa || defaultGpa;
        const gpaB = b.grades?.aggregate?.average_gpa || defaultGpa;
        console.log(a.instructors[0].shortened_name, b.instructors[0].shortened_name)
        console.log(gpaA, gpaB)
        return gpaA < gpaB ? -1 : 1;
    }

    const sortCoursesByGPA = (a: Course, b: Course) => {
        const defaultGpa = direction === "Ascending" ? 5 : -1;
        const getGpa = (offering: CourseOffering) => {
            return offering.grades?.aggregate?.average_gpa || defaultGpa;
        }
        const minOrMax = direction === "Ascending" ? (a: CourseOffering, b: CourseOffering) => {
            return getGpa(a) < getGpa(b) ? a : b;
        } : (a: CourseOffering, b: CourseOffering) => {
            return getGpa(a) > getGpa(b) ? a : b;
        };
        const getOffering = (course: Course) => {
            return course.offerings.reduce((min, current) => minOrMax(min, current));
        }
        return sortOfferingsByGPA(getOffering(a), getOffering(b));
    }

    const sortInstructorsByRMP = (a: Instructor, b: Instructor) => {
        const defaultRmp = direction === "Ascending" ? 6 : -1;
        const rmpA = a.review?.avgRating || defaultRmp;
        const rmpB = b.review?.avgRating || defaultRmp;
        return rmpA < rmpB ? -1 : 1;
    }

    const sortOfferingsByRMP = (a: CourseOffering, b: CourseOffering) => {
        const defaultRmp = direction === "Ascending" ? 6 : -1;
        const getRmp = (instructor: Instructor) => {
            return instructor.review?.avgRating || defaultRmp;
        }
        const minOrMax = direction === "Ascending" ? (a: Instructor, b: Instructor) => {
            return getRmp(a) < getRmp(b) ? a : b;
        } : (a: Instructor, b: Instructor) => {
            return getRmp(a) > getRmp(b) ? a : b;
        };
        const getInstructor = (offering: CourseOffering) => {
            return offering.instructors.reduce((min, current) => minOrMax(min, current));
        }
        return sortInstructorsByRMP(getInstructor(a), getInstructor(b))
    }

    const sortCoursesByRMP = (a: Course, b: Course) => {
        const defaultRmp = direction === "Ascending" ? 6 : -1;
        const getInstructor = (offering: CourseOffering) => {
            const getRmp = (instructor: Instructor) => {
                return instructor.review?.avgRating || defaultRmp;
            }
            const minOrMax = direction === "Ascending" ? (a: Instructor, b: Instructor) => {
                return getRmp(a) < getRmp(b) ? a : b;
            } : (a: Instructor, b: Instructor) => {
                return getRmp(a) > getRmp(b) ? a : b;
            };
            return offering.instructors.reduce((min, current) => minOrMax(min, current));
        }
        const getRmp = (offering: CourseOffering) => {
            return getInstructor(offering).review?.avgRating || defaultRmp;
        }
        const minOrMax = direction === "Ascending" ? (a: CourseOffering, b: CourseOffering) => {
            return getRmp(a) < getRmp(b) ? a : b;
        } : (a: CourseOffering, b: CourseOffering) => {
            return getRmp(a) > getRmp(b) ? a : b;
        };
        const getOffering = (course: Course) => {
            return course.offerings.reduce((min, current) => minOrMax(min, current));
        }
        return sortOfferingsByRMP(getOffering(a), getOffering(b));
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

    const filterRestrictions = (offering: CourseOffering) => {
        const restrictions = offering.restrictions
        if (!restrictions) {
            return true;
        }

        if (restrictions.includes("or")) {
            return restrictionTypes.has(restrictions[0]) || restrictionTypes.has(restrictions[restrictions.length-1]);
        } else {
            return restrictionTypes.has(restrictions[0]) && restrictionTypes.has(restrictions[restrictions.length-1]);
        }
    }

    const courses = props.courses.map(course => {
        const newCourse = Object.assign({}, course);
        newCourse.offerings = newCourse.offerings.filter(filterSectionType).filter(filterStatus).filter(filterDays).filter(filterRestrictions);
        if (sortWithin) {
            console.log(newCourse.offerings.slice())
            newCourse.offerings = newCourse.offerings.sort(sortBy === "GPA" ? sortOfferingsByGPA : sortOfferingsByRMP);
            if (direction === "Descending") {
                newCourse.offerings.reverse();
            }
        }
        return newCourse;
    }).filter(
        ({offerings}) => offerings.length
    ).sort(
        sortBy === "Name" ? sortCoursesByName : (sortBy === "GPA" ? sortCoursesByGPA : sortCoursesByRMP)
    );
    if (direction === "Descending") {
        courses.reverse();
    }
    return (
        <table className="h-0 table-fixed text-center overflow-x-scroll min-w-full border-spacing-0 border-separate rounded">
            {courses.map(course => <CourseResult key={course.id} course={course}/>)}
        </table>
    )
}