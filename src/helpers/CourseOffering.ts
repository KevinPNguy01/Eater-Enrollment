import { CourseOffering } from "types/CourseOffering";

/**
 * Two offerings are equal if the have the same quarter, year, and section code.
 * @param offering1 
 * @param offering2 
 * @returns Whether the two offerings are equal.
 */
export function offeringEquals(offering1: CourseOffering, offering2: CourseOffering) {
    const {quarter: q1, year: y1, section: {code: c1}} = offering1;
    const {quarter: q2, year: y2, section: {code: c2}} = offering2;
    return (q1 === q2) && (y1 === y2) && (c1 === c2);
}