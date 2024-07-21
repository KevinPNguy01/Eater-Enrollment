import { useState } from "react";
import { Course } from "../../../constants/Types";
import { CourseInfo } from "./CourseInfo";
import { OfferingResult } from "./OfferingResult";

// Spacer table row to separate other CourseResults.
const spacerRow = (height: number) => (<tr><td className={`py-${height}`} colSpan={99}></td></tr>);

const downArrowIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
    <path fill="#bbb" stroke="#bbb" stroke-width="0.5" transform="translate(0,-1.5)" d="M8 9.8l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293L8 9.8z"/>
</svg>

const upArrowIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
    <path fill="#bbb" stroke="#bbb" stroke-width="0.5" transform="translate(16,17.5) rotate(180)" d="M8 9.8l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293L8 9.8z"/>
</svg>

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
                <td colSpan={99}>
                    <span className="flex p-2 text-base text-[#0000]">{`${course.department} ${course.number}: ${course.title}`}{infoVisible ? upArrowIcon : downArrowIcon}</span>
                    <span
                        onClick={() => setInfoVisible(!infoVisible)}
                        className={`flex items-center gap-2 select-none left-0 top-0 absolute max-w-full w-fit bg-tertiary p-2 rounded-xl font-semibold text-left text-base hover:cursor-pointer ${infoVisible ? "rounded-b-none border-b-0 z-20" : ""}`}
                    >
                        {`${course.department} ${course.number}: ${course.title}`}{infoVisible ? upArrowIcon : downArrowIcon}
                    </span>
                </td>
                {infoVisible ? <CourseInfo course={course}/>: null}
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