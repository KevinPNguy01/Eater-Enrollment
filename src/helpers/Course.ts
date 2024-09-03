import { requestGrades } from "api/PeterPortalGraphQL";
import { offeringEquals } from "helpers/CourseOffering";
import { Course } from "types/Course";
import { CourseOffering } from "types/CourseOffering";
import { newGradeDistributionCollection, updateGradesCollection } from "./GradeDistributionCollection";

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
 */
export async function populateGrades(courses: Course[]) {
    const offerings = courses.map(course => course.offerings).flat();
    const grades = await requestGrades(courses);

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