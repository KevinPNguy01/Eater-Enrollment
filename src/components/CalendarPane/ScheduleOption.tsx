import { useContext } from "react"
import { ScheduleContext } from "../Main/App"

export function ScheduleOption(props: {name: string, index: number}) {
    const {scheduleIndex, loadSchedule} = useContext(ScheduleContext);
    return (
        <div 
            onClick={() => loadSchedule(props.index)}
            className={`flex p-2 ${scheduleIndex === props.index ? "!bg-quaternary" : "bg-secondary"} hover:bg-tertiary hover:cursor-pointer`}
        >
            <p>
                {props.name}
            </p>
        </div>
    )
}