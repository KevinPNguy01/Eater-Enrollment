import { Course } from "types/Course";
import { CourseOffering } from "types/CourseOffering";
import { getOfferingColor } from "utils/FullCalendar";
import { parseFinal, parseMeeting } from "utils/ParseMeeting";
import coursesJson from "../../src/assets/allCourses.json";

// Load all courses from JSON file.
const courseMap = new Map<string, Course>((coursesJson as { data: { allCourses: Course[] } }).data.allCourses.map(course => [course.id, course]));

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
export function groupOfferings(offerings: CourseOffering[]): Course[] {
    const courseOfferings = new Map<string, CourseOffering[]>();
    offerings.forEach((offering) => {
        if (!offering.course) return;       // TODO: Try to fetch from rest API.
        const id = offering.course.id;
        if (!courseOfferings.has(id)) {
            courseOfferings.set(id, []);
        }
        courseOfferings.get(id)!.push(offering);
    });

    // Process each course here.
    const courses = Array.from(courseOfferings.entries()).map(([id, offerings]) => {
        const course = { ...courseMap.get(id) } as Course;                              // Fetch Course object from parsed JSON.
        course.offerings = offerings;                                                   // Attach offerings to course.
        course.prerequisite_list = course.prerequisite_list.filter(course => course);   // Filter null prerequisites.

        // Process each offering here.
        offerings.forEach(offering => {
            offering.course = { ...course };                                                        // Assign course as copy to prevent circular reference.
            offering.course.offerings = [];                                                         // Prevent circular reference.
            offering.parsed_meetings = offering.meetings.map(meeting => parseMeeting(meeting));     // Parse each meeting.
            offering.final = parseFinal(offering.final_exam);                                       // Parse final.
            offering.color = getOfferingColor(offering);                                            // Calculate default color.
        });

        return course;
    });
    return courses;
}