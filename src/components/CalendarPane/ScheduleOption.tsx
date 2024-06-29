import { useContext } from "react"
import { ScheduleContext } from "../Main/App"

export function ScheduleOption(props: {name: string, index: number}) {
    const {addedCourses, scheduleIndex, loadSchedule} = useContext(ScheduleContext);
    return (
        <div 
            onClick={() => {loadSchedule(props.index)}}
            className={`flex justify-between p-2 ${scheduleIndex === props.index ? "!bg-quaternary" : "bg-secondary"} hover:bg-tertiary hover:cursor-pointer`}
        >
            <p>{props.name}</p>
            <div>
                <button 
                    className="font-bold text-sm hover:bg-red-500 rounded w-fit p-1 aspect-square whitespace-pre" 
                    onClick={(event) => {
                        event.stopPropagation();
                        if (addedCourses.length > 1) {
                            addedCourses.splice(props.index, 1)
                            loadSchedule(Math.min(scheduleIndex, addedCourses.length-1));
                        }
                    }}
                >{" ✕ "}</button>
            </div>
        </div>
    )
}