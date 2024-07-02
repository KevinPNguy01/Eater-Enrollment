import { useState } from "react";
import { Course } from "../../../constants/types";
import { OfferingResult } from "./OfferingResult";
import { CourseInfo } from "./CourseInfo";

// Spacer table row to separate other CourseResults.
const spacerRow = (<tr><td colSpan={99}><br/></td></tr>);

/**
 * Component for displaying a Course result as a tbody, to be used in ScheduleResult.
 */
export function CourseResult(props: {course: Course}) {
    const [infoVisible, setInfoVisible] = useState(false);
    const course = props.course;
    return (
        <tbody className="text-xs">
            {/* Table row for displaying course information. */}
            <tr className="relative">
                <td colSpan={99} className="bg-tertiary p-2 border border-quaternary rounded font-bold text-left text-base hover:cursor-pointer" onClick={() => setInfoVisible(!infoVisible)}>
                    {`${course.department} ${course.number}: ${course.title}`}
    
                </td>
                {infoVisible ? <CourseInfo course={course}/>: null}
            </tr>
            {spacerRow}
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
            {spacerRow}
        </tbody>
    )
}