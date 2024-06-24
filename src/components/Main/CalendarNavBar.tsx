import { ChangeEvent, useContext } from "react"
import { ScheduleContext } from "./App"

export function CalendarNavBar() {
    const { addedCourses, currentSchedule, createSchedule, loadSchedule, saveSchedule } = useContext(ScheduleContext);

    const onChangeFunc = (event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target.selectedIndex === addedCourses.size) {
            createSchedule("Schedule " + (1 + addedCourses.size));
        } else {
            loadSchedule(event.target.selectedOptions[0].value);
        }
    }

    return(
        <nav className="bg-tertiary h-12 grid grid-cols-3 my-1">
            <select className="drop-down m-2 bg-secondary border border-quaternary" onChange={onChangeFunc}>
                {
                    Array.from(addedCourses.keys()).map((scheduleName) => (
                        <option value={scheduleName} selected={scheduleName === currentSchedule}>{scheduleName}</option>
                    ))
                }
                <option value="add">
                    + Add Schedule
                </option>
            </select>
            <button className="bg-secondary m-2 border border-quaternary" onClick={() => saveSchedule()}>
                💾
            </button>
        </nav>
    )
}