import { useContext } from "react";
import { ScheduleContext } from "../App";
import { ScheduleResults } from "../../features/results/components/ScheduleResult";

export function AddedTab() {
    const { scheduleIndex, addedCourses } = useContext(ScheduleContext);
    return <ScheduleResults courses={addedCourses[scheduleIndex].courses}/>
}