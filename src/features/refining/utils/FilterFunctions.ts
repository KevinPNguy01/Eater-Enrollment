import { restrictionCodes } from "../../../constants/RestrictionCodes";
import { Course, CourseOffering } from "../../../constants/Types";
import { parseTime } from "../../../utils/Time";

/**
 * @param sectionTypes A set of strings representing the valid sectionTypes types.
 * @returns A function to filter out course offerings with an invalid section type.
 */
export function filterSectionTypes(sectionTypes: Set<string>) {
    return ({section}: CourseOffering) => sectionTypes.has(section.type);
}

/**
 * @param statusTypes A set of strings representing the valid status types.
 * @returns A function to filter out course offerings with an invalid status type.
 */
export function filterStatus(statusTypes: Set<string>) {
    return ({status}: CourseOffering) => statusTypes.has(status)
}

/**
 * @param dayTypes A set of strings representing the available days.
 * @returns A function to filter out course offerings that meet outside of the given days.
 */
export function filterDays(dayTypes: Set<string>) {
    return (offering: CourseOffering) => {
        let days = offering.meetings[0].days;
        dayTypes.forEach(day => days = days.replace(day, ""));
        return days === "";
    }
}

/**
 * @param timeRange A tuple of two numbers representing the start and end minutes.
 * @returns A function to filter out course offerings that meet outside of the give times.
 */
export function filterTime(timeRange: [number, number]) {
    return (offering: CourseOffering) => {
        if (offering.meetings[0].time === "TBA") return true;
        const [start, end] = parseTime(offering.meetings[0].time);
        return timeRange[0] <= start && start <= timeRange[1] && timeRange[0] <= end && end <= timeRange[1];
    }
}

/**
 * @param levelTypes A set of strings representing the valid course levels.
 * @returns A function to filter out courses that are not one of the included levels.
 */
export function filterLevel(levelTypes: Set<string>) {
    return (course: Course) => {
        for (const level of levelTypes) {
            if (course.course_level.includes(level)) return true;
        }
        return false;
    }
}

/**
 * @param dayTypes A set of strings representing the valid restriction codes.
 * @returns A function to filter out course offerings with unwanted restrictions.
 */
export function filterRestrictions(restrictionTypes: Set<string>) {
    return (offering: CourseOffering) => {
        const {restrictions} = offering;
        // Don't filter offerings with no restrictions.
        if (!restrictions) {
            return true;
        }
    
        // If the offering specifies either of two codes can be met, OR the codes, else AND them.
        const [code1, code2] = [restrictions[0], restrictions[restrictions.length-1]];
        const [restriction1, restriction2] = [`${code1}: ${restrictionCodes.get(code1)}`, `${code2}: ${restrictionCodes.get(code2)}`]
        const [hasCode1, hasCode2] = [restrictionTypes.has(restriction1), restrictionTypes.has(restriction2)];
        return restrictions.includes("or") ? hasCode1 || hasCode2 : hasCode1 && hasCode2;
    }
}