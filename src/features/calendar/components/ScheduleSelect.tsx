import { useState, useContext, useEffect, useRef } from "react";
import { ScheduleContext } from "../../../app/App";
import { ScheduleOption } from "./ScheduleOption";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from "react";

export function ScheduleSelect() {
    const {addedCourses, setAddedCourses, scheduleIndex, setScheduleIndex} = useContext(ScheduleContext);

    // Get the size of the dropdown.
    const ref = useRef(null as unknown as HTMLDivElement);
	const [size, setSize] = useState({x: 0, y: 0});

    const [draggedWidth, setDraggedWidth] = useState(0);
    const [dragged, setDragged] = useState<number>(-1);
    const [dropZone, setDropZone] = useState(0);

    const [menu, setMenu] = useState<React.JSX.Element | null>(null);

    // Get the mouse position.
    const [mouse, setMouse] = useState({x: 0, y: 0});
    const [relative, setRelative] = useState({dx: 0, dy: 0});

    useEffect(() => {
        // Track mouse movement.
        const mouseMoveHandler = (e: MouseEvent) => setMouse(e);
        document.addEventListener("mousemove", mouseMoveHandler);

        // Track touch movement.
        const touchMoveHandler = (e: TouchEvent) => setMouse({x: e.touches.item(0)!.clientX, y: e.touches.item(0)!.clientY});
        document.addEventListener("touchmove", touchMoveHandler);

        return () => {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("touchmove", touchMoveHandler);
        };
    }, []);

	useEffect(() => {
        // Resize the div containing the dropdown to match its size.
		setSize({x: ref.current.clientWidth, y: ref.current.clientHeight});

        // Detect mouse up.
        const mouseUpHandler = (e: MouseEvent) => {
            if (dragged !== -1) {
                e.preventDefault();
                setDragged(-1);
                setAddedCourses(reorderList(addedCourses, dragged, dropZone));
                if (scheduleIndex === dragged) {
                    setScheduleIndex(dropZone <= dragged ? dropZone : dropZone -1);
                } else if (Math.min(dragged, dropZone) <= scheduleIndex && scheduleIndex <= Math.max(dragged, dropZone)) {
                    if (dropZone - dragged > 0) {
                        setScheduleIndex(scheduleIndex - 1);
                    } else {
                        setScheduleIndex(scheduleIndex + 1);
                    }
                }
            }
        };
        document.addEventListener("mouseup", mouseUpHandler);

        // Detect mouse up.
        const touchEndHandler = (e: TouchEvent) => {
            if (dragged !== -1) {
                e.preventDefault();
                e.stopPropagation();
                setDragged(-1);
                setAddedCourses(reorderList(addedCourses, dragged, dropZone));
                if (scheduleIndex === dragged) {
                    setScheduleIndex(dropZone <= dragged ? dropZone : dropZone -1);
                } else if (Math.min(dragged, dropZone) <= scheduleIndex && scheduleIndex <= Math.max(dragged, dropZone)) {
                    if (dropZone - dragged > 0) {
                        setScheduleIndex(scheduleIndex - 1);
                    } else {
                        setScheduleIndex(scheduleIndex + 1);
                    }
                }
            }
        };
        document.addEventListener("touchend", touchEndHandler);

        return () => {
            document.removeEventListener("mouseup", mouseUpHandler);
            document.removeEventListener("touchend", touchEndHandler);
        };
	}, [addedCourses, dragged, dropZone, scheduleIndex, setAddedCourses, setScheduleIndex]);

    // Get closest drop zone
    useEffect(() => {
        if (dragged !== -1) {
            // get all drop-zones
            const elements = Array.from(document.getElementsByClassName("schedule-option-drop-zone"));
            // get all drop-zones' y-axis position
            // if we were using a horizontally-scrolling list, we would get the .left property
            const positions = elements.map((e) => e.getBoundingClientRect().top);
            // get the difference with the mouse's y position
            const absDifferences = positions.map((v) => Math.abs(v - mouse.y));

            // get the item closest to the mouse
            let result = absDifferences.indexOf(Math.min(...absDifferences));

            // if the item is below the dragged item, add 1 to the index
            if (result > dragged) result += 1;
            
            if (result !== dropZone) setDropZone(result);
        }
    }, [dragged, mouse, dropZone]);

    return (
        <div>
            {menu}
            <div className="relative touch-none" style={{width: size.x, height: size.y}}>
                <div className="left-0 top-0 absolute z-[10]">
                    <Accordion className="!bg-secondary !border !border-quaternary w-full" disableGutters={true}>
                        <AccordionSummary
                            className='*:!m-0 !min-h-0 !p-1 !pl-2'
                            color="white"
                            expandIcon={<ExpandMoreIcon style={{color: "white"}}/>}
                            ref={ref}
                        >
                            <span className="text-base font-semibold text-nowrap">{`${addedCourses[scheduleIndex].name}`}</span>
                        </AccordionSummary>
                        <AccordionDetails className="text-left text-base !p-2 !pt-0">
                            {dragged !== -1 && <div key={`drop-zone-${-1}`} className={`${dragged !== -1 ? "transition-[height]" : ""} transition-linear transition-200 rounded-lg bg-[#ffffff08] h-9 schedule-option-drop-zone ${dragged === -1 || dropZone !== 0 ? "!h-0" : ""}`}/>}
                            {addedCourses.map(({name}, index) => (
                                <React.Fragment key={index}>
                                    <ScheduleOption 
                                        className={`transition-[height] transition-linear transition-200 ${dragged === index ? "hidden" : ""}`}
                                        key={`schedule-option-${index}`} 
                                        name={name} 
                                        index={index} 
                                        setMenu={setMenu}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setDragged(index);
                                            setDropZone(index);
                                            const {left, top, width} = e.currentTarget.parentElement!.getBoundingClientRect();
                                            setRelative({
                                                dx: e.clientX - left,
                                                dy: e.clientY - top
                                            });
                                            setDraggedWidth(width);
                                        }}
                                        onTouchStart={(e) => {
                                            setDragged(index);
                                            setDropZone(index);
                                            const {left, top, width} = e.currentTarget.parentElement!.getBoundingClientRect();
                                            setRelative({
                                                dx: e.touches.item(0)!.clientX - left,
                                                dy: e.touches.item(0)!.clientY - top
                                            });
                                            setMouse({
                                                x: e.touches.item(0)!.clientX,
                                                y: e.touches.item(0)!.clientY
                                            });
                                            setDraggedWidth(width);
                                        }}
                                    />
                                    {dragged !== index && dragged !== -1 && <div key={`drop-zone-${index}`} className={`${dragged !== -1 ? "transition-[height]" : ""} transition-linear transition-200 rounded-lg bg-[#ffffff08] h-9 schedule-option-drop-zone ${dragged === -1 || dropZone !== index+1 ? "!h-0" : ""}`}/>}
                                </React.Fragment>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                </div>
            </div>
            {dragged !== -1 && (
                <ScheduleOption style={{
                    left: `${mouse.x - relative.dx}px`,
                    top: `${mouse.y - relative.dy}px`,
                    width: `${draggedWidth}px`
                }} className="bg-tertiary absolute z-[1000]" name={addedCourses[dragged].name} index={dragged} setMenu={setMenu}/>
            )}
        </div>  
    );
}

const reorderList = <T,>(l: T[], start: number, end: number) => {
    if (start < end) return _reorderListForward([...l], start, end);
    else if (start > end) return _reorderListBackward([...l], start, end);
  
    return l; // if start == end
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