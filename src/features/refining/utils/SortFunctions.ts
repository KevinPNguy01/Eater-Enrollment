import { Course } from "types/Course";
import { CourseOffering } from "types/CourseOffering";
import { GradeDistributionCollection } from "types/GradeDistributionCollection";
import { Instructor } from "types/Instructor";
import { Review } from "types/Review";
import { getOfferingGrades } from "utils/GradeDistributionCollection";

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
 * Sorts two strings by their letters and numbers.
 * @param a The first string to compare.
 * @param b The second string to compare.
 * @returns A negative number if a < b, a positive number if a > b, and 0 if they are equal.
 */
export function sortNumbers(a: string, b: string) {
    const aLetters = a.replace(/\d+/g, '');
    const aNumbers = (a.match(/\d+/g) || []).join('');
    const bLetters = b.replace(/\d+/g, '');
    const bNumbers = (b.match(/\d+/g) || []).join('');
    if (aNumbers !== bNumbers) return parseInt(aNumbers) - parseInt(bNumbers);
    if (aLetters !== bLetters) return aLetters.localeCompare(bLetters);
    return 0;
}

/**
 * @returns A sorting function to sort two course offerings by section number.
 */
export function sortOfferingsByName(a: CourseOffering, b: CourseOffering) {
    const aLetters = a.section.number.replace(/\d+/g, '');
    const aNumbers = (a.section.number.match(/\d+/g) || []).join('');
    const bLetters = b.section.number.replace(/\d+/g, '');
    const bNumbers = (b.section.number.match(/\d+/g) || []).join('');
    if (!aLetters && bLetters) return 1;
    if (!bLetters && aLetters) return -1;
    if (aLetters === bLetters) return aNumbers.localeCompare(bNumbers);
    return aLetters.localeCompare(bLetters);
}

/**
 * @param defaultGpa The default GPA to give to course offerings with null grades.
 * @param grades A Record of course ids to Records of instructor names to GradeDistributionCollections.
 * @returns A sorting function to sort two course offerings by GPA.
 */
export function sortOfferingsByGPA(defaultGpa: number, grades: Record<string, Record<string, GradeDistributionCollection>>) {
    return (a: CourseOffering, b: CourseOffering) => {
        const gpaA = getOfferingGrades(grades, a)?.aggregate.average_gpa || defaultGpa;
        const gpaB = getOfferingGrades(grades, b)?.aggregate.average_gpa || defaultGpa;
        return gpaA - gpaB;
    }
}

/**
 * @param defaultGpa The default GPA to give to course offerings with null grades.
 * @param grades A Record of course ids to Records of instructor names to GradeDistributionCollections.
 * @returns A sorting function to sort two courses by GPA.
 */
export function sortCoursesByGPA(defaultGpa: number, grades: Record<string, Record<string, GradeDistributionCollection>>) {
    return (a: Course, b: Course) => {
        // Find the offering to represent the given course when comparing GPA.
        const getOffering = (course: Course) => {
            return course.offerings.reduce((a, b) => sortOfferingsByGPA(defaultGpa, grades)(a, b) < 0 ? a : b);
        }
        return sortOfferingsByGPA(defaultGpa, grades)(getOffering(a), getOffering(b));
    }
}

/**
 * @param defaultRmp The default rating to give to instructors with no reviews.
 * @param reviews A record of instructor names to Reviews.
 * @returns A sorting function to sort two instructors by their average rating.
 */
export function sortInstructorsByRMP(defaultRmp: number, reviews: Record<string, Review>) {
    return (a: Instructor, b: Instructor) => {
        const rmpA = reviews[a.shortened_name]?.avgRating || defaultRmp;
        const rmpB = reviews[b.shortened_name]?.avgRating || defaultRmp;
        return rmpA < rmpB ? -1 : 1;
    }
}

/**
 * @param defaultRmp The default rating to give to instructors with no reviews.
 * @param reviews A record of instructor names to Reviews.
 * @returns A sorting function to sort course offerings by their instructors' ratings.
 */
export function sortOfferingsByRMP(defaultRmp: number, reviews: Record<string, Review>) {
    return (a: CourseOffering, b: CourseOffering) => {
        // Find the instructor to represent the given course offering when comparing RMP.
        const getInstructor = (offering: CourseOffering) => {
            return offering.instructors.reduce((a, b) => sortInstructorsByRMP(defaultRmp, reviews)(a, b) < 0 ? a : b);
        }
        return sortInstructorsByRMP(defaultRmp, reviews)(getInstructor(a), getInstructor(b));
    }
}

/**
 * @param defaultRmp The default rating to give to instructors with no reviews.
 * @param reviews A record of instructor names to Reviews.
 * @returns A sorting function to sort courses by their instructors' ratings.
 */
export function sortCoursesByRMP(defaultRmp: number, reviews: Record<string, Review>) {
    return (a: Course, b: Course) => {
        // Find the offering to represent the given course when comparing RMP.
        const getOffering = (course: Course) => {
            return course.offerings.reduce((a, b) => sortOfferingsByRMP(defaultRmp, reviews)(a, b) < 0 ? a : b);
        }
        return sortOfferingsByRMP(defaultRmp, reviews)(getOffering(a), getOffering(b));
    }
} 