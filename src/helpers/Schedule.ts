import { Course } from "../types/Course";
import { CourseOffering } from "../types/CourseOffering";
import { Schedule } from "../types/Schedule";
import { courseContainsOffering } from "./Course";

export function scheduleContainsOffering(schedule: Schedule, offering: CourseOffering) {
    if (!scheduleContainsCourse(schedule, offering.course)) {
        return false;
    }
    const course = scheduleGetCourse(schedule, offering. course);
    return courseContainsOffering(course, offering);
}

export function scheduleContainsCourse(schedule: Schedule, course: Course) {
    const foundCourse = schedule.courses.find(({id}) => id === course.id);
    return foundCourse !== undefined;
}

export function scheduleGetCourse(schedule: Schedule, course: Course) {
    let foundCourse = schedule.courses.find(({id}) => id === course.id);
    if (!foundCourse) {
        foundCourse = {...course};
        foundCourse.offerings = [];
        schedule.courses.push(foundCourse);
    }
    return foundCourse;
}

export function scheduleAddOffering(schedule: Schedule, offering: CourseOffering) {
    // If the corresponding course was never added before, create a new course with empty offerings.
    // Add offering to the correct course.
    const course = scheduleGetCourse(schedule, offering.course);
    if (!courseContainsOffering(course, offering)) {
        course.offerings.push(offering);
    }
}

export function scheduleRemoveOffering(schedule: Schedule, offering: CourseOffering) {
    // Remove course offering from appropriate course.
    const course = scheduleGetCourse(schedule, offering.course);
    const offerings = course.offerings;
    const index = offerings.findIndex((other_offering) => other_offering.section.code === offering.section.code);
    if (index > -1) {
        offerings.splice(index, 1);
    }
    // If the course has no offerings, remove it.
    if (offerings.length == 0) {
        schedule.courses.splice(schedule.courses.findIndex(({id}) => id === course.id));
    }
}