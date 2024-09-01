import { ColoredText } from "../../../components/ColoredText";
import { typeColors, statusColors } from "../../../constants/TextColors";
import { RateMyProfessorsLink } from "./RateMyProfessorsLink";
import { ZotisticsLink } from "./ZotisticsLink";
import { BuildingLink } from "./BuildingLink";
import { useDispatch, useSelector } from "react-redux";
import { scheduleContainsOffering } from "../../../helpers/Schedule";
import { CourseOffering } from "../../../types/CourseOffering";
import { selectCurrentSchedule, selectCurrentScheduleIndex } from "../../store/selectors/ScheduleSetSelectors";
import { addOffering, removeOffering } from "../../store/slices/ScheduleSetSlice";

/**
 * Component for displaying a course result as a tr, to be used in CourseResult.
 */
export function OfferingResult(props: {offering: CourseOffering}) {
    const {offering} = props;

    return (
        <tr className="course-result odd:bg-quaternary even:bg-tertiary" key={offering.section.code}>
            <td>
                <CourseCheckBox offering={offering}/>
            </td>
            <td>
                {offering.section.code}
            </td>
            <td>
                <div>
                    <ColoredText text={offering.section.type} colorRules={typeColors}/>
                    <p>{"Sec: " + offering.section.number}</p>
                    <p>{"Units: " + offering.units}</p>
                </div>
            </td>
            <td>
                {offering.instructors.map((instructor, index) => 
                    <RateMyProfessorsLink key={index} instructor={instructor}/>)
                }
            </td>
            <td>
                <ZotisticsLink offering={offering}/>
            </td>
            <td>
                {`${offering.meetings[0].days} ${offering.meetings[0].time}`}
            </td>
            <td>
                <BuildingLink location={offering.meetings[0].building}/>
            </td>
            <td>
                <p>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</p>
                <p>{`WL: ${offering.num_on_waitlist}`}</p>
                <p>{`NOR: ${offering.num_new_only_reserved}`}</p>
            </td>
            <td>
                <ColoredText text={offering.status} colorRules={statusColors}/>
            </td>
            <td>
                {offering.restrictions}
            </td>
        </tr>)
}

/**
 * Checkbox for adding and removing a CourseOffering, to be used in OfferingResult.
 */
function CourseCheckBox(props: {offering: CourseOffering}) {
    const currentSchedule = useSelector(selectCurrentSchedule);
    const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
    const dispatch = useDispatch();
    const {offering} = props;

    // Add or remove offering depending on the box was checked or unchecked.
    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(event.target.checked ? addOffering({offering, index: currentScheduleIndex}) : removeOffering({offering, index: currentScheduleIndex}));
    };

    return (
        <input 
            type="checkbox"
            onChange={handleCheckBoxChange}
            className={`checkbox-${offering.course.id}-${offering.section.code}`}
            defaultChecked={scheduleContainsOffering(currentSchedule, offering)}
        />
    );
}