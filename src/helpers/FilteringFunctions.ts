import { CourseOffering } from "../constants/Types";

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
        const [hasCode1, hasCode2] = [restrictionTypes.has(code1), restrictionTypes.has(code2)];
        return restrictions.includes("or") ? hasCode1 || hasCode2 : hasCode1 && hasCode2;
    }
}