import { useContext } from 'react';
import { Course, CourseOffering, Instructor } from '../../../constants/types'
import { ScheduleContext } from '../../Main/App';

// Define colors for various keywords.
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

/**
 * Component for displaying a course result as a tr, to be used in CourseResult.
 */
export function OfferingResult(props: {offering: CourseOffering}) {
    const offering = props.offering
    const course = offering.course;

    return (
        <tr className="course-result odd:bg-quaternary even:bg-tertiary" key={offering.section.code}>
            <td><CourseCheckBox course={course} offering={offering}/></td>
            <td>{offering.section.code}</td>
            <td className={`${typeColors.get(offering.section.type)}`}>{offering.section.type}</td>
            <td>{offering.instructors.map(instructor => <RateMyProfessorsLink key={instructor.shortened_name} instructor={instructor}/>)}</td>
            <td>{offering.gpa ? (Math.round((offering.gpa + Number.EPSILON) * 100) / 100).toFixed(2) : ""}</td>
            <td>{offering.rmp ? (Math.round((offering.rmp + Number.EPSILON) * 100) / 100).toFixed(1) : ""}</td>
            <td>{`${offering.meetings[0].days} ${offering.meetings[0].time}`}</td>
            <td>{offering.meetings[0].building}</td>
            <td>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</td>
            <td className={`${statusColors.get(offering.status)}`}>{offering.status}</td>
            <td>{offering.restrictions}</td>
        </tr>)
}

/**
 * Checkbox for adding and removing a CourseOffering, to be used in OfferingResult.
 */
function CourseCheckBox(props: {course: Course, offering: CourseOffering}) {
    const { addOffering, removeOffering, containsOffering } = useContext(ScheduleContext);
    const offering = props.offering;

    // Add or remove offering depending on the box was checked or unchecked.
    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        (event.target.checked ? addOffering : removeOffering)(offering);
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

/**
 * RateMyProfessors link tag for the given instructor, or a regular text tag if the instructor is STAFF.
 */
function RateMyProfessorsLink(props: {instructor: Instructor}) {
    const name = props.instructor.shortened_name;
    if (name === "STAFF") return <p>{name}</p>;
    const rmp_link = `https://www.ratemyprofessors.com/search/professors/1074?q=${name.replace(/,/g, '').replace(/\./g, '')}`;
    return <a href={rmp_link} target="_blank" rel="noopener noreferrer" className="text-sky-500 underline">{name}<br/></a>;
}