import { useContext } from "react"
import { ScheduleContext } from "../Main/App"

export function ScheduleOption(props: {name: string}) {
    const {currentSchedule, loadSchedule} = useContext(ScheduleContext);
    return (
        <div 
            onClick={() => loadSchedule(props.name)}
            className={`flex p-2 ${props.name === currentSchedule ? "!bg-quaternary" : "bg-secondary"} hover:bg-tertiary hover:cursor-pointer`}
        >
            <p>
                {props.name}
            </p>
        </div>
    )
}