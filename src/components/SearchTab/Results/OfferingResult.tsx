import { useContext } from 'react';
import { Course, CourseOffering } from '../../../constants/Types'
import { ScheduleContext } from '../../Main/App';
import { RateMyProfessorsLink } from './RateMyProfessorsLink';
import { ZotisticsLink } from './ZotisticsLink';
import { ColoredText } from '../../Global/ColoredText';
import { statusColors, typeColors } from '../../../constants/TextColors';

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
            <td><ColoredText text={offering.section.type} colorRules={typeColors}/></td>
            <td>{offering.instructors.map((instructor, i) => <RateMyProfessorsLink key={`${instructor.shortened_name}-${i}`} instructor={instructor}/>)}</td>
            <td>{<ZotisticsLink grades={offering.grades} offering={offering}/>}</td>
            <td>{`${offering.meetings[0].days} ${offering.meetings[0].time}`}</td>
            <td>{offering.meetings[0].building}</td>
            <td>
                <p>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</p>
                <p>{`WL: ${offering.num_on_waitlist}`}</p>
                <p>{`NOR: ${offering.num_new_only_reserved}`}</p>
            </td>
            <td><ColoredText text={offering.status} colorRules={statusColors}/></td>
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
    );
}