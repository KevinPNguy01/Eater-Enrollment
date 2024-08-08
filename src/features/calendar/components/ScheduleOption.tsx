import { useContext, useState } from "react";
import { ScheduleContext } from "../../../app/App";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export function ScheduleOption(props: {name: string, index: number} & React.HTMLAttributes<HTMLDivElement>) {
    const {addedCourses, scheduleIndex, renamed, loadSchedule} = useContext(ScheduleContext);
    const [renaming, setRenaming] = useState(false);
    return (
        <div 
            onClick={() => {loadSchedule(props.index)}}
            style={props.style}
            className={`flex items-center justify-between p-2 ${scheduleIndex === props.index ? "!bg-quaternary" : "bg-secondary"} hover:bg-tertiary hover:cursor-pointer border-b border-tertiary ${props.className}`}
        > 
            <div className="cursor-move" onMouseDown={props.onMouseDown}>
                <DragIndicatorIcon style={{height: "1.25rem", color: "rgb(255, 255, 255, 0.25)"}}/>
            </div>
            {renaming ? (
                <input 
                    autoFocus 
                    defaultValue={addedCourses[props.index].name} 
                    onBlur={() => {
                        setTimeout(()=>setRenaming(false), 100);
                    }}
                    onChange={event => {
                        addedCourses[props.index].name=event.currentTarget.value;
                        renamed();
                    }}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            setRenaming(false);
                        }
                    }}
                />
                ) : <p className="text-nowrap">{props.name}</p>
            }
            <div className="flex flex-nowrap">
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