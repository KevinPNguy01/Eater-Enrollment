import { ScheduleResults } from "features/results/components/ScheduleResult";
import { useSelector } from "react-redux";
import { selectCurrentSchedule } from "stores/selectors/ScheduleSet";

export function AddedTab() {
    const currentSchedule = useSelector(selectCurrentSchedule);
    return <ScheduleResults courses={currentSchedule.courses} />
}