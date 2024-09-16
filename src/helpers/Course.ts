import { offeringEquals } from "helpers/CourseOffering";
import { Course } from "types/Course";
import { CourseOffering } from "types/CourseOffering";
import { newGradeDistributionCollection, updateGradesCollection } from "./GradeDistributionCollection";
import coursesJson from "../../src/assets/allCourses.json";
import { GradeDistributionCollection } from "types/GradeDistributionCollection";

// Load all courses from JSON file.
export const courseMap = new Map<string, Course>((coursesJson as { data: { allCourses: Course[] } }).data.allCourses.map(course => [course.id, course]));

/**
 * @param course 
 * @param offering 
 * @returns Whether the course contains the given course offering.
 */
export function courseContainsOffering(course: Course, offering: CourseOffering) {
    return course.offerings.map(otherOffering => offeringEquals(offering, otherOffering)).some(val => val);
}

/**
 * Populate the grades field for every offering of the given courses.
 * @param courses 
 * @param grades A map of "<department> <number> <instructor>" to GradeDistributions.
 */
export async function populateGrades(courses: Course[], grades: Map<string, GradeDistributionCollection>) {
    const offerings = courses.map(course => course.offerings).flat();

    // Calculate and set grades for each course offering.
    offerings.forEach((offering) => {
        const course = offering.course;
        if (!course) return;

        // Combine grades for when there are multiple instructors teaching a single course offering.
        const combinedGrades = newGradeDistributionCollection();
        for (const instructor of offering.instructors) {
            const instructorGrades = grades.get(`${course.department} ${course.number} ${instructor.shortened_name}`.toUpperCase());
            if (instructorGrades && instructor.shortened_name !== "STAFF") {
                updateGradesCollection(combinedGrades, instructorGrades);
                combinedGrades.instructors.push(instructor.shortened_name)
            }
        }

        // Use average grades from all instructors if the instructor is unspecified or has no grades records.
        const staffGrades = grades.get(`${course.department} ${course.number} STAFF`.toUpperCase())
        if (staffGrades && !combinedGrades.instructors.length) updateGradesCollection(combinedGrades, staffGrades);
        offering.grades = combinedGrades;
    });
}