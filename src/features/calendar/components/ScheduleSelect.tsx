import { useState, useContext } from "react";
import { ScheduleContext } from "../../../app/App";
import { ScheduleOption } from "./ScheduleOption";

export function ScheduleSelect() {
    const [visible, setVisible] = useState(false);
    const {addedCourses, scheduleIndex, createSchedule} = useContext(ScheduleContext);
    return (
        <div className="relative rounded border border-quaternary bg-secondary m-2 p-1 select-none">
            <div className="flex hover:cursor-pointer justify-between" onClick={() => setVisible(!visible)}>
                <p>{addedCourses[scheduleIndex].name}</p>
                <p>{visible ? "⮝" : "⮟"}</p>
            </div>
            
            {visible ? (
                <div className="absolute w-full z-20 bg-secondary border border-quaternary left-0 top-full">
                    {addedCourses.map(({name}, index) => (<ScheduleOption key={index} name={name} index={index}/>))}
                    <button className="p-2 text-left hover:bg-tertiary w-full" onClick={() => createSchedule("Schedule " + (1 + addedCourses.length))}>
                        + New Schedule
                    </button>
                </div>
            ) : null}
        </div>
    )
}