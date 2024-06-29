import { useContext, useState } from "react"
import { ScheduleContext } from "../Main/App"

export function ScheduleOption(props: {name: string, index: number}) {
    const {addedCourses, scheduleIndex, renamed, loadSchedule} = useContext(ScheduleContext);
    const [renaming, setRenaming] = useState(false);
    return (
        <div 
            onClick={() => {loadSchedule(props.index)}}
            className={`flex justify-between p-2 ${scheduleIndex === props.index ? "!bg-quaternary" : "bg-secondary"} hover:bg-tertiary hover:cursor-pointer`}
        >
            {renaming ? (
                    <input 
                        className="" 
                        autoFocus 
                        defaultValue={addedCourses[props.index].name} 
                        onBlur={() => {
                            setTimeout(()=>setRenaming(false), 100);
                        }}
                        onChange={e => {
                            addedCourses[props.index].name=e.currentTarget.value;
                            renamed();
                        }}
                    />
                ) : (
                    <p>{props.name}</p>)
            }
            <div>
                <button 
                    className="font-bold text-sm hover:bg-neutral-500 rounded w-fit p-1 aspect-square whitespace-pre"
                    onClick={(event) => {
                        event.stopPropagation();
                        setRenaming(true);
                    }}
                >
                ✏️
                </button>
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