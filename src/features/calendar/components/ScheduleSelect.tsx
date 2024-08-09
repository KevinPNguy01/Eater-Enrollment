import { useState, useContext, useEffect, useRef } from "react";
import { ScheduleContext } from "../../../app/App";
import { ScheduleOption } from "./ScheduleOption";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export function ScheduleSelect() {
    const {addedCourses, setAddedCourses, scheduleIndex, setScheduleIndex} = useContext(ScheduleContext);

    // Get the size of the dropdown.
    const ref = useRef(null as unknown as HTMLDivElement);
	const [size, setSize] = useState({x: 0, y: 0});

    const [draggedWidth, setDraggedWidth] = useState(0);
    const [dragged, setDragged] = useState<number | null>(null);
    const [dropZone, setDropZone] = useState(0);

    const [menu, setMenu] = useState<React.JSX.Element | null>(null);

    // Get the mouse position.
    const [mouse, setMouse] = useState({x: 0, y: 0});
    const [relative, setRelative] = useState({dx: 0, dy: 0});
	useEffect(() => {
        // Resize the div containing the dropdown to match its size.
		setSize({x: ref.current.clientWidth, y: ref.current.clientHeight});

        // Track mouse movement.
        const mouseMoveHandler = (e: MouseEvent) => setMouse(e);
        document.addEventListener("mousemove", mouseMoveHandler);

        // Detect mouse up.
        const mouseUpHandler = (e: MouseEvent) => {
            if (dragged !== null) {
                e.preventDefault();
                setDragged(null);
                setAddedCourses(reorderList(addedCourses, dragged, dropZone));
                if (scheduleIndex === dragged) {
                    setScheduleIndex(dropZone <= dragged ? dropZone : dropZone -1);
                } else if (Math.min(dragged, dropZone) < scheduleIndex && scheduleIndex < Math.max(dragged, dropZone)) {
                    if (dropZone - dragged > 0) {
                        setScheduleIndex(scheduleIndex - 1);
                    } else {
                        setScheduleIndex(scheduleIndex + 1);
                    }
                }
            }
        };
        document.addEventListener("mouseup", mouseUpHandler);

        return () => {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
        };
	}, [addedCourses, dragged, dropZone, scheduleIndex, setAddedCourses, setScheduleIndex]);

    // Get closest drop zone
    useEffect(() => {
        if (dragged !== null) {
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

            setDropZone(result);
        }
    }, [dragged, mouse]);

    return (
        <div>
            {menu}
            <div className="relative" style={{width: size.x, height: size.y}}>
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
                            <div key={`drop-zone-${-1}`} className={`h-9 schedule-option-drop-zone ${dragged === null || dropZone !== 0 ? "!h-0" : ""}`}/>
                            {addedCourses.map(({name}, index) => (
                                dragged != index && (
                                    <>
                                        <ScheduleOption 
                                            key={index} 
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
                                        />
                                        <div key={`drop-zone-${index}`} className={`h-9 schedule-option-drop-zone ${dragged === null || dropZone !== index+1 ? "!h-0" : ""}`}/>
                                    </>
                                )
                            ))}
                        </AccordionDetails>
                    </Accordion>
                </div>
            </div>
            {dragged != null && (
                <ScheduleOption style={{
                    left: `${mouse.x - relative.dx}px`,
                    top: `${mouse.y - relative.dy}px`,
                    width: `${draggedWidth}px`
                }} className="absolute z-[1000]" name={addedCourses[dragged].name} index={dragged} setMenu={setMenu}/>
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