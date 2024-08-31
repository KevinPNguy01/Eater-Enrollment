import { Course } from "../types/Course";
import { CourseOffering } from "../types/CourseOffering";
import { offeringEquals } from "./CourseOffering";

/**
 * @param course 
 * @param offering 
 * @returns Whether the course contains the given course offering.
 */
export function courseContainsOffering(course: Course, offering: CourseOffering) {
    return course.offerings.map(otherOffering => offeringEquals(offering, otherOffering)).some(val => val);
}