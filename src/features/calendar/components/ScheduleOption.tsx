import { useContext, useState } from "react";
import { ScheduleContext } from "../../../app/App";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Backdrop, Button, Card, IconButton } from "@mui/material";

export function ScheduleOption(props: {name: string, index: number, setMenu: (menu: React.JSX.Element | null) => void} & React.HTMLAttributes<HTMLDivElement>) {
    const {addedCourses, scheduleIndex, renamed, loadSchedule, setAddedCourses} = useContext(ScheduleContext);
    const [renaming, setRenaming] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div 
            onClick={() => {loadSchedule(props.index)}}
            style={props.style}
            className={`flex items-center px-2 py-0 gap-2 rounded-lg ${menuOpen && "!bg-tertiary"} font-semibold ${scheduleIndex === props.index ? "!bg-quaternary text-white" : "text-neutral-300"} hover:bg-tertiary hover:cursor-pointer ${props.className}`}
        > 
            {window.matchMedia("(pointer: fine)").matches && (
                <div className="cursor-move" onMouseDown={props.onMouseDown}>
                    <DragIndicatorIcon fontSize="small" style={{color: "rgb(255, 255, 255, 0.25)"}}/>
                </div>
            )}
            {renaming ? (
                <input 
                    className="w-fit"
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
                ) : <p className="flex-grow text-nowrap">{props.name}</p>
            }
            <IconButton 
                className="hover:!bg-[#ffffff10]"
                onClick={e => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                    if (!menuOpen) {
                        props.setMenu(
                            <Backdrop 
                                className="hover:cursor-default !z-30"
                                open={!menuOpen}
                                invisible
                                onClick={e => {
                                    e.stopPropagation();
                                    setMenuOpen(false);
                                    props.setMenu(null);
                                }}
                            >
                                <Card
                                    className="absolute translate-x-4 -translate-y-1/2 flex flex-col"
                                    style={{left: e.clientX, top: e.clientY}}
                                >
                                    <Button className="pr-4 !justify-start" color="white" onClick={() => {
                                        setAddedCourses([...addedCourses, {name: addedCourses[props.index].name, courses: [...addedCourses[props.index].courses.map(course => {
                                            const newCourse = {...course};
                                            newCourse.offerings = [...course.offerings];
                                            return newCourse;
                                        })]}]);
                                    }} startIcon={
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ml-1.5 bi bi-copy" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                                        </svg>
                                    }>
                                        Duplicate
                                    </Button>
                                    <Button className="pr-4 !justify-start" color="white" onClick={() => {
                                        setRenaming(true);
                                    }} startIcon={(
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ml-1.5 bi bi-pencil-square" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                        </svg>
                                    )}>
                                        Rename
                                    </Button>
                                    <Button className="pr-4 !justify-start" color="white" onClick={() => {
                                        if (addedCourses.length > 1) {
                                            addedCourses.splice(props.index, 1)
                                            loadSchedule(Math.min(scheduleIndex, addedCourses.length-1));
                                        }
                                    }} startIcon={(
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ml-1.5 bi bi-trash" viewBox="0 0 16 16">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                        </svg>
                                    )}>
                                        Remove
                                    </Button>
                                </Card>
                            </Backdrop>
                        );
                    } else {
                        props.setMenu(null);
                    }
                }}
            >
                <MoreHorizIcon fontSize="small" style={{color: "rgb(255, 255, 255, 0.5)"}}/>
            </IconButton>
        </div>
    )
}