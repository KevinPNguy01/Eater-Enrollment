import { Course } from "types/Course";
import { CourseInfo } from "./CourseInfo";
import { OfferingResult } from "./OfferingResult";
import useWindowDimensions from "utils/WindowDimensions";

// Spacer table row to separate other CourseResults.
const spacerRow = (height: number) => (<tr><td className={`py-${height}`} colSpan={99}></td></tr>);

/**
 * Component for displaying a Course result as a tbody, to be used in ScheduleResult.
 */
export function CourseResult(props: { course: Course }) {
    const course = props.course;
    const { height, width } = useWindowDimensions();
    const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) || (width > height && 1.33 * width / 2 < height);
    return (
        <tbody className={`${isMobile ? "text-2xs" : "text-xs"}`}>
            {/* Table row for displaying course information. */}
            <tr>
                <td colSpan={99}>
                    <CourseInfo course={course} />
                </td>
            </tr>
            {spacerRow(1)}

            {/* Header row. */}
            <tr className={`course-result bg-secondary ${isMobile ? "text-2xs" : "text-xs"}`}>
                <th></th>
                <th className="py-1">Code</th>
                <th>Type</th>
                <th>Instructors</th>
                <th>GPA</th>
                <th>Time</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th className="px-1">Restrictions</th>
            </tr>

            {/* Create an OfferingResult for each offering of this course. */}
            {course.offerings.map(offering => <OfferingResult key={`${course.id}-${offering.section.code}`} offering={offering} />)}
            {spacerRow(2)}
        </tbody>
    )
}