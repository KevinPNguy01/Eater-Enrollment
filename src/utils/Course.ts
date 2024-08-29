import { Course, CourseOffering } from "../constants/Types";

export function courseContainsOffering(course: Course, offering: CourseOffering) {
    return course.offerings.map(({section}) => section.code === offering.section.code).some(val => val);
}