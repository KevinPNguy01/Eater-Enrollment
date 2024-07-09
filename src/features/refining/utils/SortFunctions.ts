import { Course, CourseOffering, Instructor } from "../../../constants/Types";

/**
 * Sorts two courses by their department and court number.
 */
export function sortCoursesByName(a: Course, b: Course) {
    // Sort by department if they are different.
    if (a.department !== b.department) {
        return a.department.localeCompare(b.department);
    }

    // Sort by course number if they are different.
    const numA = a.number.replace(/[a-z]+/ig, '');
    const numB = b.number.replace(/[a-z]+/ig, '');
    if (numA !== numB) {
        return (numA.length !== numB.length) ? (numA.length - numB.length) : numA.localeCompare(numB);
    }

    // Sort by identifier last.
    const identifierA = a.number.replace(/[0-9]/g, '');
    const identifierB = b.number.replace(/[0-9]/g, '');
    return identifierA.localeCompare(identifierB);
}

/**
 * @param defaultGpa The default GPA to give to course offerings with null grades.
 * @returns A sorting function to sort two course offerings by GPA.
 */
export function sortOfferingsByGPA(defaultGpa: number) {
    return (a: CourseOffering, b: CourseOffering) => {
        const gpaA = a.grades?.aggregate?.average_gpa || defaultGpa;
        const gpaB = b.grades?.aggregate?.average_gpa || defaultGpa;
        return gpaA - gpaB;
    }
}

/**
 * @param defaultGpa The default GPA to give to course offerings with null grades.
 * @returns A sorting function to sort two courses by GPA.
 */
export function sortCoursesByGPA(defaultGpa: number) {
    return (a: Course, b: Course) => {
        // Find the offering to represent the given course when comparing GPA.
        const getOffering = (course: Course) => {
            return course.offerings.reduce((a, b) => sortOfferingsByGPA(defaultGpa)(a, b) < 0 ? a : b);
        }
        return sortOfferingsByGPA(defaultGpa)(getOffering(a), getOffering(b));
    }
} 

/**
 * @param defaultRmp The default rating to give to instructors with no reviews.
 * @returns A sorting function to sort two instructors by their average rating.
 */
export function sortInstructorsByRMP(defaultRmp: number) {
    return (a: Instructor, b: Instructor) => {
        const rmpA = a.review?.avgRating || defaultRmp;
        const rmpB = b.review?.avgRating || defaultRmp;
        return rmpA < rmpB ? -1 : 1;
    }
} 

/**
 * @param defaultRmp The default rating to give to instructors with no reviews.
 * @returns A sorting function to sort course offerings by their instructors' ratings.
 */
export function sortOfferingsByRMP(defaultRmp: number) {
    return (a: CourseOffering, b: CourseOffering) => {
        // Find the instructor to represent the given course offering when comparing RMP.
        const getInstructor = (offering: CourseOffering) => {
            return offering.instructors.reduce((a, b) => sortInstructorsByRMP(defaultRmp)(a, b) < 0 ? a : b);
        }
        return sortInstructorsByRMP(defaultRmp)(getInstructor(a), getInstructor(b));
    }
} 

/**
 * @param defaultRmp The default rating to give to instructors with no reviews.
 * @returns A sorting function to sort courses by their instructors' ratings.
 */
export function sortCoursesByRMP(defaultRmp: number) {
    return (a: Course, b: Course) => {
        // Find the offering to represent the given course when comparing RMP.
        const getOffering = (course: Course) => {
            return course.offerings.reduce((a, b) => sortOfferingsByRMP(defaultRmp)(a, b) < 0 ? a : b);
        }
        return sortOfferingsByRMP(defaultRmp)(getOffering(a), getOffering(b));
    }
} 