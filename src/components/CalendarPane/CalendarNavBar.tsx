import { useContext } from "react"
import { ScheduleContext } from "../Main/App"
import { ScheduleSelect } from "./ScheduleSelect";

export function CalendarNavBar() {
    const { saveSchedule } = useContext(ScheduleContext);

    return(
        <nav className="bg-tertiary h-12 grid grid-cols-3 my-1">
            <ScheduleSelect/>
            <button className="bg-secondary m-2 border border-quaternary" onClick={() => saveSchedule()}>
                💾
            </button>
        </nav>
    )
}