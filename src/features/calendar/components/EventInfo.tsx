import { useState, useContext, useEffect, useRef } from "react";
import { SketchPicker } from "react-color";
import { ScheduleContext } from "../../../app/App";
import { RateMyProfessorsLink } from "../../results/components/RateMyProfessorsLink";
import { Card, IconButton } from "@mui/material";
import { BuildingLink } from "../../results/components/BuildingLink";
import DeleteIcon from '@mui/icons-material/Delete';
import PaletteIcon from '@mui/icons-material/Palette';
import useWindowDimensions from "../../../utils/WindowDimensions";
import { EventClickArg } from "fullcalendar/index.js";

export function EventInfo(
    {eventClickArg, eventClickArg: {event}, close, calendarRect, scrollPos}: 
    {eventClickArg: EventClickArg, close: () => void, scrollPos: number, calendarRect: DOMRect}
) {
    const {removeOffering, colorRules, setColorRules, addedCourses, scheduleIndex} = useContext(ScheduleContext);
    const ref = useRef(null as unknown as HTMLDivElement);
    const screenSize = useWindowDimensions();
    
    // Color of component, color picker, and event.
    const [color, setColor] = useState(event.backgroundColor);
    const [textColor, setTextColor] = useState(event.textColor as "white" | "black");
    // Whether to show color picker.
    const [colorVisible, setColorVisible] = useState(false);

    // Where this component should be positioned.
    const [pos, setPos] = useState({x:0, y:0});

    /**
     * Reposition the EventInfo card relative to the selected calendar event.
     * Triggered whenever the selected event, component size, screen size, calendar size, or calendar scroll position changes.
     */
    useEffect(() => {
        setPos(calculatePosition(calendarRect, eventClickArg.el.getBoundingClientRect(), ref.current))
    }, 
        [eventClickArg, ref.current?.clientWidth, ref.current?.clientHeight, screenSize, calendarRect, scrollPos]
    );

    // Get the color and text color everytime the selected event changes.
    useEffect(() => {
        setColor(event.backgroundColor);
        setTextColor(event.textColor as "white" | "black");
    }, [event]);

    // Get the offering this event corresponds to.
    const offering = addedCourses[scheduleIndex].courses.map(
        ({offerings}) => offerings
    ).flat().find(
        ({section: {code}}) => code === event.id.split("-")[0]
    );
    // If no offering was found, then do not render.
    if (!offering) return;

    // Div containing the color picker.
    const colorPicker = colorVisible ? 
        <Card elevation={3} className="absolute bg-tertiary top-full left-1/2 -translate-x-1/2 translate-y-5">
            <SketchPicker 
                className="!bg-tertiary [&_label]:!text-white"
                color={color}
                onChange={color => {
                    const {r, g, b} = color.rgb;
                    setColor(color.hex);
                    setTextColor((0.299 * r + 0.587 * g + 0.114 * b)/255 < 0.5 ? "white" : "black");
                    setColorRules(new Map([...colorRules, [`${offering.quarter} ${offering.year} ${offering.section.code}`, color.rgb]]));
                }}
            />
        </Card>
    : null;
    
    const spacerRow = <tr><td colSpan={2} className="border-b border-quaternary"></td></tr>;
    return (
        <div 
            className={`${!pos.x ? "opacity-0" : ""} !overflow-visible absolute !z-10`} 
            style={{top: `${pos.y}px`, left: `${pos.x}px`}}
            onClick={e => e.stopPropagation()} 
            ref={ref} 
        >
            <Card elevation={3} className="!overflow-visible !rounded-xl relative bg-tertiary">
                <div 
                    className="flex justify-between items-center bg-secondary p-2 gap-8 rounded-t-xl" 
                    style={{backgroundColor: color, color: textColor}}
                >
                    <p className="font-semibold px-2 text-nowrap">{event.title}</p>
                    <div className="flex">
                        <IconButton color={textColor} onClick={() => setColorVisible(!colorVisible)}>
                            <PaletteIcon/>
                        </IconButton>
                        <IconButton color={textColor} onClick={() => {
                            removeOffering(offering);
                            close();
                        }}>
                            <DeleteIcon/>
                        </IconButton>
                    </div>
                </div>
                <table className="border-spacing-x-4 border-separate py-3"><tbody>
                    <tr className="border border-quaternary">
                        <td className="align-top text-sm text-right">Instructors</td>
                        <td><div className="grid justify-items-start *:align-top *:!overflow-clip">
                            {offering.instructors.map(
                                (instructor) => {
                                    return <RateMyProfessorsLink instructor={instructor}/>
                                }
                            )}
                        </div></td>
                    </tr>
                    {spacerRow}
                    <tr>
                        <td className="text-sm text-right">Location</td>
                        <td className="*:float-left *:!overflow-clip"><BuildingLink location={offering.meetings[0].building}/></td>
                    </tr>
                </tbody></table>
                {colorPicker}
            </Card>
        </div>
    );
}

const calculatePosition = (calendarRect: DOMRect, eventRect: DOMRect, componentSize: {clientHeight: number, clientWidth: number}) => {
    const {
        height: eventHeight,
        width: eventWidth, 
        top: eventTop, 
        bottom: eventBottom, 
        left: eventLeft
    } = eventRect;
    const {
        height: calendarHeight,
        width: calendarWidth, 
        top: calendarTop
    } = calendarRect;
    const {clientHeight: componentHeight, clientWidth: componentWidth} = componentSize;

    // Default position: To the right of the event, centered vertically.
    let x = eventLeft + eventWidth + 5;
    let y = eventTop - calendarTop + eventHeight/2 - componentHeight/2;
    // If the component overflows to the right of the calendar, position it to the left of the event.
    if (x + componentWidth > calendarWidth) {
        x = eventLeft - componentWidth - 10;
        // If the component overflows to the left of the calendar, position it below the event, centered horizontally.
        if (x < 0) {
            x = Math.max(5, eventLeft + eventWidth/2 - componentWidth/2);
            y = eventBottom - calendarTop + 5;
            // If the component overflows to the right, try sticking to right, then left.
            if (x + componentWidth > calendarWidth) {
                x = Math.max(5, calendarWidth - componentWidth - 5);
            }
            // If the component overflows to the bottom, position it above the event.
            if (y + componentHeight > calendarHeight) {
                y = Math.max(5, eventTop - calendarTop - componentHeight - 5);
            }
        }
    }
    return {x, y};
}