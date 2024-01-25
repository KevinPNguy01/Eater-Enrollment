import { Course, CourseOffering } from "../constants";
const CourseResult = (props: {course: Course}) => {
    const course = props.course;
    return (
        <div>
            <p 
                key={`${course.department}${course.number}`}
            >
                {`${course.department} ${course.number}: ${course.title}`}
            </p>
            <table className="h-full table-fixed text-center overflow-x-scroll min-w-full">
                <thead className="text-sm">
                    <tr className="first:bg-tertiary">
                        <th className="p-2">Code</th>
                        <th>Type</th>
                        <th>Instructors</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Restrictions</th>
                    </tr>
                </thead>
                <tbody className="text-xs">
                    {course.offerings.map((offering) => (
                    <tr className="odd:bg-quaternary even:bg-tertiary" key={offering.section.code}>
                        <td className="py-2">{offering.section.code}</td>
                        <td>{offering.section.type}</td>
                        <td>{offering.instructors[0].shortened_name}</td>
                        <td>{`${offering.meetings[0].days} ${offering.meetings[0].time}`}</td>
                        <td>{offering.meetings[0].building}</td>
                        <td>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</td>
                        <td>{offering.status}</td>
                        <td>{offering.restrictions}</td>
                    </tr>)
                    )}
                </tbody>

            </table>
        </div>
    )
}

export default CourseResult