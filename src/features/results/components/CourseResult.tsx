import { Course } from "types/Course";
import { CourseInfo } from "./CourseInfo";
import { OfferingResult } from "./OfferingResult";

// Spacer table row to separate other CourseResults.
const spacerRow = (height: number) => (<tr><td className={`py-${height}`} colSpan={99}></td></tr>);

/**
 * Component for displaying a Course result as a tbody, to be used in ScheduleResult.
 */
export function CourseResult(props: {course: Course}) {
    const course = props.course;
    return (
        <tbody className="text-xs">
            {/* Table row for displaying course information. */}
            <tr>
                <td colSpan={99}>
                    <CourseInfo course={course}/>
                </td>
            </tr>
            {spacerRow(1)}

            {/* Header row. */}
            <tr className="course-result bg-secondary">
                <th></th>
                <th className="p-2">Code</th>
                <th>Type</th>
                <th>Instructors</th>
                <th>GPA</th>
                <th>Time</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Restrictions</th>
            </tr>
            
            {/* Create an OfferingResult for each offering of this course. */}
            {course.offerings.map(offering => <OfferingResult key={`${course.id}-${offering.section.code}`} offering={offering}/>)}
            {spacerRow(2)}
        </tbody>
    )
}