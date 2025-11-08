import { ColoredText } from "components/ColoredText";
import { statusColors, typeColors } from "constants/TextColors";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentSchedule, selectCurrentScheduleIndex } from "stores/selectors/ScheduleSet";
import { addOffering, removeOffering } from "stores/slices/ScheduleSet";
import { CourseOffering } from "types/CourseOffering";
import { scheduleContainsOffering } from "../../../helpers/Schedule";
import { BuildingLink } from "./BuildingLink";
import { RateMyProfessorsLink } from "./RateMyProfessorsLink";
import { ZotisticsLink } from "./ZotisticsLink";
import useWindowDimensions from "utils/WindowDimensions";
import { enqueueSnackbar } from "notistack";
import { Tooltip } from "@mui/material";

const restrictionCodes: Record<string, string> = {
  "A": "Prerequisite required",
  "B": "Authorization code required",
  "C": "Fee required",
  "D": "Pass/Not Pass option only",
  "E": "Freshmen only",
  "F": "Sophomores only",
  "G": "Lower-division only",
  "H": "Juniors only",
  "I": "Seniors only",
  "J": "Upper-division only",
  "K": "Graduate only",
  "L": "Major only",
  "M": "Non-major only",
  "N": "School major only",
  "O": "Non-school major only",
  "R": "Biomedical Pass/Fail course (School of Medicine only)",
  "S": "Satisfactory/Unsatisfactory only",
  "X": "Separate authorization codes required to add, drop, or change enrollment"
}

/**
 * Component for displaying a course result as a tr, to be used in CourseResult.
 */
export function OfferingResult(props: { offering: CourseOffering }) {
    const { offering } = props;
    const { height, width } = useWindowDimensions();
    const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) || (width > height && 1.33 * width / 2 < height);

    const toolTipText = offering.restrictions.split(" and ").map(code => (
        <>
            {code}: {restrictionCodes[code]}
            <br />
        </>
    ))

    return (
        <tr className={`course-result odd:bg-quaternary even:bg-tertiary ${isMobile ? "text-2xs" : "text-xs"}`} key={offering.section.code}>
            <td className="!p-2">
                <CourseCheckBox offering={offering} />
            </td>
            <td className="flex justify-center items-center h-full">
                <span className="cursor-pointer hover:bg-[#666] rounded-full py-1 px-2 w-fit flex justify-center" onClick={() => {
                    navigator.clipboard.writeText(`${offering.section.code}`);
                    enqueueSnackbar(`Copied to clipboard!`, { variant: "info" });
                }}>
                    {offering.section.code}
                </span>
            </td>
            <td>
                <div>
                    <ColoredText text={offering.section.type} colorRules={typeColors} />
                    <p>{"Sec: " + offering.section.number}</p>
                    <p>{"Units: " + offering.units}</p>
                </div>
            </td>
            <td>
                {offering.instructors.map((instructor, index) =>
                    <RateMyProfessorsLink key={index} instructor={instructor} />)
                }
            </td>
            <td>
                <ZotisticsLink offering={offering} />
            </td>
            <td>
                {`${offering.meetings[0].days} ${offering.meetings[0].time}`}
            </td>
            <td>
                <BuildingLink location={offering.meetings[0].building} />
            </td>
            <td>
                <p>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</p>
                <p>{`WL: ${offering.num_on_waitlist}`}</p>
                <p>{`NOR: ${offering.num_new_only_reserved}`}</p>
            </td>
            <td>
                <ColoredText text={offering.status} colorRules={statusColors} />
            </td>
            <td>
                {offering.restrictions && (
                    <Tooltip title={toolTipText} placement="top" arrow>
                        <span className="cursor-pointer hover:bg-[#666] rounded-full py-1 px-2 mx-auto w-fit flex justify-center">
                            {offering.restrictions}
                        </span>
                    </Tooltip>
                )}
            </td>
        </tr>)
}

/**
 * Checkbox for adding and removing a CourseOffering, to be used in OfferingResult.
 */
function CourseCheckBox(props: { offering: CourseOffering }) {
    const currentSchedule = useSelector(selectCurrentSchedule);
    const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
    const dispatch = useDispatch();
    const { offering } = props;

    // Add or remove offering depending on the box was checked or unchecked.
    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(event.target.checked ? addOffering({ offering, index: currentScheduleIndex }) : removeOffering({ offering, index: currentScheduleIndex }));
    };

    return (
        <input type="checkbox" onChange={handleCheckBoxChange} checked={scheduleContainsOffering(currentSchedule, offering)} />
    );
}