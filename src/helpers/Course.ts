import { Course } from "../types/Course";
import { CourseOffering } from "../types/CourseOffering";

export function courseContainsOffering(course: Course, offering: CourseOffering) {
    return course.offerings.map(({section}) => section.code === offering.section.code).some(val => val);
}