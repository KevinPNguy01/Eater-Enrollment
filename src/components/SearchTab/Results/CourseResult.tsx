import { Course, CourseOffering } from "../../../constants/types";
import { useContext, useState } from "react";
import { ScheduleContext } from "../../Main/App";
import { populateReviews } from "../../../helpers/RateMyProfessors";

export function CourseResult(props: {course: Course}) {
    const [gotReviews, setGotReviews] = useState(false);

    const course = props.course;
    const statusColors = new Map([
        ["OPEN", "text-green-500"],
        ["NewOnly", "text-cyan-500"],
        ["Waitl", "text-blue-500"],
        ["FULL", "text-red-500"]
    ]);
    const typeColors = new Map([
        ["Lec", "text-red-500"],
        ["Dis", "text-orange-500"],
        ["Lab", "text-cyan-500"],
        ["Sem", "text-blue-500"],
        ["Stu", "text-green-500"],
        ["Fld", "text-green-500"],
        ["Tut", "text-yellow-500"],
        ["Tap", "text-yellow-500"],
        ["Res", "text-rose-500"],
        ["Col", "text-rose-500"],
        ["Act", "text-indigo-500"],
        ["Qiz", "text-indigo-500"]
    ]);

    const updateReviews = async () => {
        await populateReviews([course]);
        setGotReviews(true);
    }
    if (!gotReviews) {
        updateReviews();
    }

    return (
        <div>
            <p 
                className="bg-tertiary p-2 border border-quaternary rounded mb-2 font-bold"
                key={`${course.department}${course.number}`}
            >
                {`${course.department} ${course.number}: ${course.title}`}
            </p>
            <table className="course-result h-full table-fixed text-center overflow-x-scroll min-w-full border-spacing-0 border-separate rounded border border-quaternary">
                <thead className="text-sm">
                    <tr className="first:bg-tertiary">
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
                </thead>
                <tbody className="text-xs">
                    {course.offerings.map((offering) => {
                        offering.course = course;
                        return (
                            <tr className="odd:bg-quaternary even:bg-tertiary" key={offering.section.code}>
                                <td><CourseCheckBox course={course} offering={offering}/></td>
                                <td className="py-2">{offering.section.code}</td>
                                <td>
                                    <p className={`${typeColors.get(offering.section.type)}`}>{offering.section.type}</p>
                                </td>
                                <td>
                                    {offering.instructors.map(
                                        (instructor) => {
                                            const name = instructor.shortened_name;
                                            const rmp_link = `https://www.ratemyprofessors.com/search/professors/1074?q=${name.replace(/,/g, '').replace(/\./g, '')}`
                                            if (name === "STAFF") return (<p>{name}</p>)
                                            return (<a href={rmp_link} target="_blank" rel="noopener noreferrer" className="text-sky-500 underline">{name}<br/></a>)
                                        }
                                    )}
                                </td>
                                <td>{offering.gpa ? (Math.round((offering.gpa + Number.EPSILON) * 100) / 100).toFixed(2) : ""}</td>
                                <td>{offering.rmp ? (Math.round((offering.rmp + Number.EPSILON) * 100) / 100).toFixed(1) : ""}</td>
                                <td>{`${offering.meetings[0].days} ${offering.meetings[0].time}`}</td>
                                <td>{offering.meetings[0].building}</td>
                                <td>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</td>
                                <td>
                                    <p className={`${statusColors.get(offering.status)}`}>{offering.status}</p>
                                </td>
                                <td>{offering.restrictions}</td>
                            </tr>)
                        }
                    )}
                </tbody>

            </table>
            <br/>
        </div>
    )
}

function CourseCheckBox(props: {course: Course, offering: CourseOffering}) {
    const { addOffering, removeOffering, containsOffering } = useContext(ScheduleContext);
    const offering = props.offering;

    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            addOffering(offering)
        } else {
            removeOffering(offering);
        }
    };

    return (
        <input 
            type="checkbox"
            onChange={handleCheckBoxChange}
            className={`checkbox-${offering.course.id}-${offering.section.code}`}
            defaultChecked={containsOffering(offering)}
        />
    )
}