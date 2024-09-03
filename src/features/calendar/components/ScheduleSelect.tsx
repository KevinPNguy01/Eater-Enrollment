import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentSchedule, selectCurrentScheduleIndex, selectScheduleSet } from "stores/selectors/ScheduleSet";
import { addSchedule, reorderScheduleSet, setCurrentScheduleIndex } from "stores/slices/ScheduleSet";
import useWindowDimensions from "utils/WindowDimensions";
import { ScheduleOption } from "./ScheduleOption";

export function ScheduleSelect() {
    const scheduleSet = useSelector(selectScheduleSet);
    const currentSchedule = useSelector(selectCurrentSchedule);
    const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
    const dispatch = useDispatch();

    const [draggedWidth, setDraggedWidth] = useState(0);                // Size of the dragged schedule option.
    const [dragged, setDragged] = useState<number | null>(null);        // Index of dragged schedule option.
    const [dropZone, setDropZone] = useState(0);                        // Index of nearest drop zone.
    const [actionMenu, setActionMenu] = useState<React.JSX.Element | null>(null);   // Action menu for schedule option.

    const [mouse, setMouse] = useState({ x: 0, y: 0 });           // Mouse/touch position.
    const [relative, setRelative] = useState({ dx: 0, dy: 0 });   // Mouse/touch distance from drag handle.

    const { height, width } = useWindowDimensions();

    // Add event listener for when mouse/touch moves.
    useEffect(() => {
        const mouseTouchMoveHandler = (e: MouseEvent | TouchEvent) => {
            setMouse(e instanceof MouseEvent ? e : { x: e.touches.item(0)!.clientX, y: e.touches.item(0)!.clientY })
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
            dispatch(reorderScheduleSet({ start: dragged, end: dropZone }));
            if (currentScheduleIndex === dragged) {
                dispatch(setCurrentScheduleIndex(dropZone <= dragged ? dropZone : dropZone - 1));
            }
            else if (Math.min(dragged, dropZone) <= currentScheduleIndex && currentScheduleIndex <= Math.max(dragged, dropZone)) {
                dispatch(setCurrentScheduleIndex(currentScheduleIndex + (dropZone <= dragged ? 1 : -1)));
            }
        }
        document.addEventListener("mouseup", mouseTouchUpHandler);
        document.addEventListener("touchend", mouseTouchUpHandler);
        return () => {
            document.removeEventListener("mouseup", mouseTouchUpHandler);
            document.removeEventListener("touchend", mouseTouchUpHandler);
        };
    }, [dispatch, dragged, dropZone, currentScheduleIndex]);

    // Event handler to start dragging a schedule option.
    const mouseTouchDownHandler = (index: number) => (e: React.MouseEvent | React.TouchEvent) => {
        const pos = e.type == "mousedown" ? (e as React.MouseEvent) : (e as React.TouchEvent).touches.item(0)!;
        setDragged(index);
        setDropZone(index);
        const { left, top, width } = e.currentTarget!.parentElement!.getBoundingClientRect();
        setRelative({ dx: pos.clientX - left, dy: pos.clientY - top });
        setMouse({ x: pos.clientX, y: pos.clientY });
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
            <AccordionSummary className='*:!m-0 !min-h-0 !p-1 !pl-2' expandIcon={<ExpandMoreIcon style={{ color: "white" }} />}>
                <span className={`text-nowrap ${width < height ? "text-sm" : "text-base"}`}>{`${currentSchedule.name}`}</span>
            </AccordionSummary>
            <AccordionDetails className="text-left text-base !p-2 !pt-0">
                {scheduleSet.map(({ name }, index) => (
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
                        expandIcon={<ExpandMoreIcon style={{ color: "white" }} />}
                    >
                        <span className={`font-semibold text-nowrap ${width < height ? "text-sm" : "text-base"}`}>{`${currentSchedule.name}`}</span>
                    </AccordionSummary>
                    <AccordionDetails className="text-left text-base !p-2 !pt-0">
                        {dragged !== null && <DropZone index={-1} dropZone={dropZone} />}
                        {scheduleSet.map(({ name }, index) => (
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
                                {dragged !== index && dragged !== null && <DropZone key={`drop-zone-${index}`} index={index} dropZone={dropZone} />}
                            </React.Fragment>
                        ))}
                        {/** Add new schedule button. */}
                        <Button
                            color="white"
                            className={`${width < height ? "!text-sm" : "!text-base"} w-full !rounded-lg !justify-start !font-semibold`}
                            startIcon={<AddIcon />}
                            onClick={() => dispatch(addSchedule({ id: -1, name: "New Schedule", courses: [], customEvents: [] }))}
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
                    name={scheduleSet[dragged].name}
                    index={dragged} setMenu={setActionMenu}
                />
            )}
            {/** The menu to edit a schedule option. */}
            {actionMenu}
        </>
    );
}

const DropZone = ({ index, dropZone }: { index: number, dropZone: number }) => {
    return <div className={`transition-[height] rounded-lg bg-[#ffffff08] schedule-option-drop-zone ${dropZone === index + 1 ? "h-9" : "h-0"}`} />;
}