import { Course } from "types/Course";
import { CourseOffering } from "types/CourseOffering";
import { Schedule } from "types/Schedule";
import { courseContainsOffering } from "./Course";
import { offeringEquals } from "./CourseOffering";
import { CustomEvent } from "types/CustomEvent";

/**
 * @param schedule 
 * @param course 
 * @returns Whether the schedule contains the given course.
 */
export function scheduleContainsCourse(schedule: Schedule, course: Course) {
    const foundCourse = schedule.courses.find(({ id }) => id === course.id);
    return foundCourse !== undefined;
}

/**
 * Searches for a course matching the given course inside the schedule.
 * If one is found, return it.
 * Else, add that course to the schedule and return it.
 * @param schedule 
 * @param course 
 * @returns A course object contained by the given schedule.
 */
export function scheduleGetCourse(schedule: Schedule, course: Course) {
    let foundCourse = schedule.courses.find(({ id }) => id === course.id);
    if (!foundCourse) {
        foundCourse = { ...course };
        foundCourse.offerings = [];
        schedule.courses.push(foundCourse);
    }
    return foundCourse;
}

/**
 * @param schedule 
 * @param offering 
 * @returns Whether the schedule contains the given course offering.
 */
export function scheduleContainsOffering(schedule: Schedule, offering: CourseOffering) {
    if (!scheduleContainsCourse(schedule, offering.course)) {
        return false;
    }
    const course = scheduleGetCourse(schedule, offering.course);
    return courseContainsOffering(course, offering);
}

/**
 * Add an offering to the schedule.
 * @param schedule 
 * @param offering 
 */
export function scheduleAddOffering(schedule: Schedule, offering: CourseOffering) {
    // Add offering to the correct course.
    const course = scheduleGetCourse(schedule, offering.course);
    if (!courseContainsOffering(course, offering)) {
        course.offerings.push(offering);
    }
}

/**
 * Remove an offering from the schedule.
 * @param schedule 
 * @param offering 
 */
export function scheduleRemoveOffering(schedule: Schedule, offering: CourseOffering) {
    // Find the appropriate course.
    const course = scheduleGetCourse(schedule, offering.course);
    const offerings = course.offerings;
    // If a matching offering was found, remove it
    const index = offerings.findIndex((otherOffering) => offeringEquals(offering, otherOffering));
    if (index > -1) {
        offerings.splice(index, 1);
    }
    // If the course has no offerings, remove it.
    if (offerings.length == 0) {
        schedule.courses.splice(schedule.courses.findIndex(({ id }) => id === course.id), 1);
    }
}

/**
 * Add a custom event to the schedule.
 * @param schedule 
 * @param customEvent 
 * @returns 
 */
export function scheduleAddCustomEvent(schedule: Schedule, customEvent: CustomEvent) {
    const ids = new Set(schedule.customEvents.map(({ id }) => id));
    let id = customEvent.id;
    if (id === -1) {
        for (id = 0; ids.has(id); ++id);
    }
    if (ids.has(id)) {
        return;
    }
    customEvent.id = id;
    schedule.customEvents.push(customEvent);
}

/**
 * Remove a custom event from the schedule.
 * @param schedule 
 * @param customEvent 
 * @returns 
 */
export function scheduleRemoveCustomEvent(schedule: Schedule, customEvent: CustomEvent) {
    schedule.customEvents = schedule.customEvents.filter(e => e.id !== customEvent.id);
}

/**
 * Clear all events from the schedule.
 * @param schedule 
 */
export function scheduleClear(schedule: Schedule) {
    schedule.courses = [];
    schedule.customEvents = [];
}

/**
 * Deep copy a schedule.
 * @param schedule 
 */
export function scheduleCopy(schedule: Schedule) {
    const newSchedule = { ...schedule };
    newSchedule.courses = [...schedule.courses].map(course => {
        const newCourse = { ...course };
        newCourse.offerings = [...course.offerings];
        return newCourse;
    });
    return newSchedule;
}