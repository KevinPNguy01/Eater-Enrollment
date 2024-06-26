import { Course } from "../../../constants/types";
import { useState } from "react";
import { populateGrades } from "../../../helpers/PeterPortalCalls";
import { OfferingResult } from "./OfferingResult";

// Spacer table row to separate other CourseResults.
const spacerRow = (<tr><td colSpan={99}><br/></td></tr>);

/**
 * Component for displaying a Course result as a tbody, to be used in ScheduleResult.
 */
export function CourseResult(props: {course: Course}) {
    const [gotGrades, setGotGrades] = useState(false);
    const course = props.course;

    if (!gotGrades) {
        (async () => {
            await populateGrades([course]);
            setGotGrades(true);
        })();
    }

    return (
        <tbody className="text-xs">
            {/* Table row for displaying course information. */}
            <tr>
                <td colSpan={99} className="bg-tertiary p-2 border border-quaternary rounded font-bold text-left text-base">
                    {`${course.department} ${course.number}: ${course.title}`}
                </td>
            </tr>
            {spacerRow}
            {/* Header row. */}
            <tr className="course-result bg-secondary">
                <th></th>
                <th className="p-2">Code</th>
                <th>Type</th>
                <th>Instructors</th>
                <th>GPA</th>
                <th>RMP</th>
                <th>Time</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Restrictions</th>
            </tr>
            {/* Create an OfferingResult for each offering of this course. */}
            {course.offerings.map(offering => <OfferingResult offering={offering}/>)}
            {spacerRow}
        </tbody>
    )
}