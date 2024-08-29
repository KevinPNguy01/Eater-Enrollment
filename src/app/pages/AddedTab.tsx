import { ScheduleResults } from "../../features/results/components/ScheduleResult";
import { useSelector } from "react-redux";
import { selectCurrentSchedule } from "../../features/schedules/selectors/ScheduleSetSelectors";

export function AddedTab() {
    const currentSchedule = useSelector(selectCurrentSchedule);
    return <ScheduleResults courses={currentSchedule.courses}/>
}