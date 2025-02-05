import { Course } from "types/Course";
import { CourseOffering } from "types/CourseOffering";
import { parseMeeting, parseFinal } from "utils/ParseMeeting";
import { courseMap } from "./Course";
import { stringColor } from "utils/FullCalendar";

/**
 * Two offerings are equal if the have the same quarter, year, and section code.
 * @param offering1 
 * @param offering2 
 * @returns Whether the two offerings are equal.
 */
export function offeringEquals(offering1: CourseOffering, offering2: CourseOffering): boolean {
    const { quarter: q1, year: y1, section: { code: c1 } } = offering1;
    const { quarter: q2, year: y2, section: { code: c2 } } = offering2;
    return (q1 === q2) && (y1 === y2) && (c1 === c2);
}

/**
 * Groups offerings into matching courses.
 * @param offerings 
 * @returns An array of Courses containing the appropriate offerings.
 */
export function groupOfferings(offerings: CourseOffering[]) {
    const courseOfferings = new Map<string, CourseOffering[]>();
    offerings.forEach((offering) => {
        const id = offering.course.id;
        // Skip offerings that don't have a valid course
        if (!courseMap.has(id)) {
            return;
        }
        if (!courseOfferings.has(id)) {
            courseOfferings.set(id, []);
        }
        courseOfferings.get(id)!.push(offering);
    });

    // Process each course here.
    const courses = Array.from(courseOfferings.entries()).map(([id, offerings]) => {
        let course = { ...courseMap.get(id) } as Course;                                    // Fetch Course object from parsed JSON.
        if (courseMap.get(id)) {
            course.offerings = offerings;                                                   // Attach offerings to course.
            course.prerequisite_list = course.prerequisite_list.filter(course => course);   // Filter null prerequisites.
        }
        // Process each offering here.
        offerings.forEach(offering => {
            if (!Object.keys(course).length) {
                course = { ...offering.course };
                course.offerings = [...offerings];
            }
            offering.course = { ...course };                                                        // Assign course as copy to prevent circular reference.
            offering.course.offerings = [];                                                         // Prevent circular reference.
            offering.parsed_meetings = offering.meetings.map(meeting => parseMeeting(meeting));     // Parse each meeting.
            offering.final = parseFinal(offering.final_exam);                                       // Parse final.
            offering.color = offering.color || stringColor(course.id + offering.section.type);        // Calculate default color.
        });
        return course;
    });
    return courses;
}