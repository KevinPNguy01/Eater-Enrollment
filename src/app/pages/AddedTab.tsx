import Card from "@mui/material/Card/Card";
import { ScheduleResults } from "features/results/components/ScheduleResult";
import { useSelector } from "react-redux";
import { selectCurrentSchedule } from "stores/selectors/ScheduleSet";

export function AddedTab() {
    const currentSchedule = useSelector(selectCurrentSchedule);
    const units = (currentSchedule.courses.map(({ offerings }) => offerings.map((offering) => parseInt(offering.units))).flat().concat(0)).reduce((a, b) => a + b);
    return (
        <div className="h-full flex flex-col gap-[1px]">
            <Card className="bg-tertiary border border-quaternary m-[1px] py-2 px-4 font-semibold text-xl drop-shadow">
                {`${currentSchedule.name} (${units} Units)`}
            </Card>
            <ScheduleResults courses={currentSchedule.courses} />
        </div>
    );
}