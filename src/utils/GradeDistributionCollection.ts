import { newGradeDistributionCollection, updateGradesCollection } from "helpers/GradeDistributionCollection";
import { CourseOffering } from "types/CourseOffering";
import { GradeDistributionCollection } from "types/GradeDistributionCollection";

export function getOfferingGrades(grades: Record<string, Record<string, GradeDistributionCollection>>, offering: CourseOffering) {
    if (!grades) {
        return null;
    }
    const { course: { department, number } } = offering;
    const courseGrades = grades[`${department} ${number}`];
    if (!courseGrades) {
        return;
    }

    // Combine grades for when there are multiple instructors teaching a single course offering.
    const combinedGrades = newGradeDistributionCollection();
    for (const instructor of offering.instructors) {
        const instructorGrades = courseGrades[instructor.shortened_name.toUpperCase()];
        if (instructorGrades && instructor.shortened_name !== "STAFF") {
            updateGradesCollection(combinedGrades, instructorGrades);
            combinedGrades.instructors.push(instructor.shortened_name)
        }
    }

    // Use average grades from all instructors if the instructor is unspecified or has no grades records.
    const staffGrades = courseGrades["STAFF"];
    if (staffGrades && !combinedGrades.instructors.length) {
        updateGradesCollection(combinedGrades, staffGrades);
    }

    return combinedGrades.instructors.length ? combinedGrades : staffGrades;
}