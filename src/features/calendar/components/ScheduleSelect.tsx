import { useState, useContext, useEffect } from "react";
import { ScheduleContext } from "../../../app/App";
import { ScheduleOption } from "./ScheduleOption";
import { Accordion, AccordionSummary, AccordionDetails, Button } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from "react";
import useWindowDimensions from "../../../utils/WindowDimensions";
import AddIcon from '@mui/icons-material/Add';

export function ScheduleSelect() {
    const {addedCourses, setAddedCourses, scheduleIndex, setScheduleIndex,} = useContext(ScheduleContext);
    const [draggedWidth, setDraggedWidth] = useState(0);                // Size of the dragged schedule option.
    const [dragged, setDragged] = useState<number | null>(null);        // Index of dragged schedule option.
    const [dropZone, setDropZone] = useState(0);                        // Index of nearest drop zone.
    const [actionMenu, setActionMenu] = useState<React.JSX.Element | null>(null);   // Action menu for schedule option.

    const [mouse, setMouse] = useState({x: 0, y: 0});           // Mouse/touch position.
    const [relative, setRelative] = useState({dx: 0, dy: 0});   // Mouse/touch distance from drag handle.

    const {height, width} = useWindowDimensions();

    // Add event listener for when mouse/touch moves.
    useEffect(() => {
        const mouseTouchMoveHandler = (e: MouseEvent | TouchEvent) => {
            setMouse(e instanceof MouseEvent ? e : {x: e.touches.item(0)!.clientX, y: e.touches.item(0)!.clientY})
        }
        document.addEventListener("mousemove", mouseTouchMoveHandler);
        document.addEventListener("touchmove", mouseTouchMoveHandler);
        return () => {
            document.removeEventListener("mousemove", mouseTouchMoveHandler);
            document.removeEventListener("touchmove", mouseTouchMoveHandler);
        };
    }, [dragged]);


    // Add event listener to rearrange list of schedule options and adjust schedule index if needed.
	useEffect(() => {
        const mouseTouchUpHandler = () => {
            if (dragged === null) return;
            setDragged(null);
            setAddedCourses(reorderList(addedCourses, dragged, dropZone));
            if (scheduleIndex === dragged) {
                setScheduleIndex(dropZone <= dragged ? dropZone : dropZone - 1);
            } 
            else if (Math.min(dragged, dropZone) <= scheduleIndex && scheduleIndex <= Math.max(dragged, dropZone)) {
                setScheduleIndex(scheduleIndex + (dropZone <= dragged ? 1 : -1));
            }
        }
        document.addEventListener("mouseup", mouseTouchUpHandler);
        document.addEventListener("touchend", mouseTouchUpHandler);
        return () => {
            document.removeEventListener("mouseup", mouseTouchUpHandler);
            document.removeEventListener("touchend", mouseTouchUpHandler);
        };
	}, [addedCourses, dragged, dropZone, scheduleIndex, setAddedCourses, setScheduleIndex]);

    // Event handler to start dragging a schedule option.
    const mouseTouchDownHandler = (index: number) => (e: React.MouseEvent | React.TouchEvent) => {
        const pos = e.type == "mousedown" ? (e as React.MouseEvent) : (e as React.TouchEvent).touches.item(0)!;
        setDragged(index);
        setDropZone(index);
        const {left, top, width} = e.currentTarget!.parentElement!.getBoundingClientRect();
        setRelative({dx: pos.clientX - left, dy: pos.clientY - top});
        setMouse({x: pos.clientX, y: pos.clientY});
        setDraggedWidth(width);
    }

    // Find the closest drop zone.
    useEffect(() => {
        if (dragged !== null) {
            // Get all drop zones and calculate each of their distances.
            const dropZones = Array.from(document.getElementsByClassName("schedule-option-drop-zone"));
            const distances = dropZones.map(e => Math.abs(e.getBoundingClientRect().top - mouse.y));

            // Set the nearest drop zone to the mouse as active.
            let result = distances.indexOf(Math.min(...distances));
            if (result > dragged) result += 1;
            if (result !== dropZone) setDropZone(result);
        }
    }, [dragged, mouse, dropZone]);

    // Invisible placeholder component so the absolute positioned dropdown appears to fit.
    const dropDownPlaceHolder = (
        <Accordion className="invisible !border !border-quaternary !rounded w-full" disableGutters={true}>
            <AccordionSummary className='*:!m-0 !min-h-0 !p-1 !pl-2' expandIcon={<ExpandMoreIcon style={{color: "white"}}/>}>
                <span className={`text-nowrap ${width < height ? "text-sm" : "text-base"}`}>{`${addedCourses[scheduleIndex].name}`}</span>
            </AccordionSummary>
            <AccordionDetails className="text-left text-base !p-2 !pt-0">
                {addedCourses.map(({name}, index) => (
                    <ScheduleOption 
                        className={width < height ? "text-sm" : "text-base"}
                        key={`schedule-option-${index}`} 
                        name={name} 
                        index={index} 
                        setMenu={setActionMenu}
                    />
                ))}
            </AccordionDetails>
        </Accordion>
    );

    return (
        <>
            {/** The actual drop down displaying the list of schedules. */}
            <div className="relative touch-none">
                {dropDownPlaceHolder}
                <Accordion className="!bg-secondary !border !border-quaternary !rounded w-full left-0 top-0 !absolute z-10" disableGutters={true}>
                    <AccordionSummary
                        className='*:!m-0 !min-h-0 !p-1 !pl-2'
                        expandIcon={<ExpandMoreIcon style={{color: "white"}}/>}
                    >
                        <span className={`font-semibold text-nowrap ${width < height ? "text-sm" : "text-base"}`}>{`${addedCourses[scheduleIndex].name}`}</span>
                    </AccordionSummary>
                    <AccordionDetails className="text-left text-base !p-2 !pt-0">
                        {dragged !== null && <DropZone index={-1} dropZone={dropZone}/>}
                        {addedCourses.map(({name}, index) => (
                            <React.Fragment key={index}>
                                <ScheduleOption 
                                    className={`${width < height ? "text-sm" : "text-base"} transition-[height] transition-linear transition-200 ${dragged === index ? "hidden" : ""}`}
                                    key={`schedule-option-${index}`} 
                                    name={name} 
                                    index={index} 
                                    setMenu={setActionMenu}
                                    onMouseDown={mouseTouchDownHandler(index)}
                                    onTouchStart={mouseTouchDownHandler(index)}
                                />
                                {dragged !== index && dragged !== null && <DropZone key={`drop-zone-${index}`} index={index} dropZone={dropZone}/>}
                            </React.Fragment>
                        ))}
                        {/** Add new schedule button. */}
                        <Button 
                            color="white"
                            className={`${width < height ? "!text-sm" : "!text-base"} w-full !rounded-lg !justify-start !font-semibold`}
                            startIcon={<AddIcon/>}
                            onClick={() => setAddedCourses([...addedCourses, {name: "New Schedule", courses: [], customEvents: []}])}
                        >
                            Add Schedule
                        </Button>
                    </AccordionDetails>
                </Accordion>
            </div>
            {/** The schedule option being dragged. */}
            {dragged !== null && (
                <ScheduleOption 
                    style={{
                        left: `${mouse.x - relative.dx}px`,
                        top: `${mouse.y - relative.dy}px`,
                        width: `${draggedWidth}px`
                    }} 
                    className={`${width < height ? "text-sm" : "text-base"} bg-tertiary absolute z-[1000]`} 
                    name={addedCourses[dragged].name} 
                    index={dragged} setMenu={setActionMenu}
                />
            )}
            {/** The menu to edit a schedule option. */}
            {actionMenu}
        </>  
    );
}

const DropZone = ({index, dropZone}: {index: number, dropZone: number}) => {
    return <div className={`transition-[height] rounded-lg bg-[#ffffff08] schedule-option-drop-zone ${dropZone === index+1 ? "h-9" : "h-0"}`}/>;
}

// Functions for reordering schedules when a schedule option is drag and dropped to a new index.
const reorderList = <T,>(l: T[], start: number, end: number) => {
    if (start < end) return _reorderListForward([...l], start, end);
    else if (start > end) return _reorderListBackward([...l], start, end);
    return l;
};
const _reorderListForward = <T,>(l: T[], start: number, end: number) => {
    const temp = l[start];
    for (let i=start; i<end; i++) {
        l[i] = l[i+1];
    }
    l[end - 1] = temp;
    return l;
};
const _reorderListBackward = <T,>(l: T[], start: number, end: number) => {
    const temp = l[start];
    for (let i = start; i > end; i--) {
        l[i] = l[i - 1];
    }
    l[end] = temp;
    return l;
};