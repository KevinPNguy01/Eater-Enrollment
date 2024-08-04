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

export function EventInfo(props: {eventClickArg: EventClickArg, close: () => void, scrollPos: number, calendarPaneRect: DOMRect}) {
    const {eventClickArg, close, calendarPaneRect, scrollPos} = props;
    const maxX = calendarPaneRect.width;
    const {event} = eventClickArg;
    const [colorVisible, setColorVisible] = useState(false);
    const [color, setColor] = useState(event.backgroundColor);
    const [r,g,b] = color.replace("rgb(", '').replace(')', '').split(',').map(num => parseInt(num));
    const [luminance, setLuminance] = useState((0.299 * r + 0.587 * g + 0.114 * b)/255);
    const {removeOffering, colorRules, setColorRules, addedCourses, scheduleIndex} = useContext(ScheduleContext);
    const ref = useRef(null as unknown as HTMLDivElement);
    const [pos, setPos] = useState({x:0, y:0});
    const {width} = useWindowDimensions();
    const {left: eventLeft, width: eventWidth, top: eventTop, bottom: eventBottom, height: eventHeight} = eventClickArg.el.getBoundingClientRect();
    useEffect(() => {
        let x = eventLeft + eventWidth + 5;
        let y = eventTop - calendarPaneRect.top + eventHeight/2 - ref.current.clientHeight/2;
        if (x + ref.current.clientWidth > maxX) {
            x = maxX - 5 - (ref.current.clientWidth);
            if (eventLeft <= x + ref.current.clientWidth && x <= eventLeft + eventWidth) {
                x = eventLeft - ref.current.clientWidth - 5;
                if (x < 0) {
                    x = Math.max(5, eventLeft + eventWidth/2 - ref.current.clientWidth/2);
                    y = eventBottom - calendarPaneRect.top + 5;
                    if (x + ref.current.clientWidth > maxX) {
                        x = Math.max(5, maxX - ref.current.clientWidth - 5);
                    }
                }
            }
        }
        setPos({x, y})
    }, [ref.current?.clientWidth, eventClickArg, event, ref, maxX, width, eventClickArg.el.clientWidth, eventClickArg.el.clientLeft, eventLeft, eventWidth, eventTop, calendarPaneRect.top, calendarPaneRect, scrollPos, eventBottom, eventHeight]);
    const offering = addedCourses[scheduleIndex].courses.map((course) => course.offerings).flat().find((offering) => offering.section.code === event.id.split("-")[0]);
    useEffect(() => {
        setColor(event.backgroundColor);
        const [r,g,b] = event.backgroundColor.replace("rgb(", '').replace(')', '').split(',').map(num => parseInt(num));
        setLuminance((0.299 * r + 0.587 * g + 0.114 * b)/255);
    }, [event]);
    if (!offering) return;
    const colorPicker = colorVisible ? 
    <Card elevation={3} className="absolute bg-tertiary top-full left-1/2 -translate-x-1/2 translate-y-5">
        <SketchPicker 
            className="!bg-tertiary [&_label]:!text-white"
            color={color}
            onChange={color => {
                const {r, g, b} = color.rgb;
                setColor(color.hex);
                setLuminance((0.299 * r + 0.587 * g + 0.114 * b)/255);
                setColorRules(new Map([...colorRules, [`${offering.quarter} ${offering.year} ${offering.section.code}`, color.rgb]]));
            }}
        />
    </Card>
    : null;
    const spacerRow = <tr><td colSpan={2} className="border-b border-quaternary"></td></tr>;
    return (
        <div onClick={e => e.stopPropagation()} className={`${!pos.x ? "opacity-0" : ""} !overflow-visible absolute !z-10`} ref={ref} style={{top: `${pos.y}px`, left: `${pos.x}px`}}>
            <Card elevation={3} className="!overflow-visible !rounded-xl relative bg-tertiary">
                <div className="flex justify-between items-center bg-secondary p-2 gap-8 rounded-t-xl" 
                    style={{backgroundColor: color, color: luminance > 0.5 ? "black" : "white"}}
                >
                    <p className="font-semibold px-2 text-nowrap">{event.title}</p>
                    <div className="flex">
                        <IconButton color={luminance > 0.5 ? "black" : "white"} onClick={() => setColorVisible(!colorVisible)}>
                            <PaletteIcon/>
                        </IconButton>
                        <IconButton color={luminance > 0.5 ? "black" : "white"} onClick={() => {
                            removeOffering(offering);
                            close();
                        }}>
                            <DeleteIcon/>
                        </IconButton>
                    </div>
                </div>
                <table className="border-spacing-x-4 border-separate py-3">
                    <tr className="border border-quaternary">
                        <td className="align-top text-sm text-right">Instructors</td>
                        <td><div className="grid justify-items-start *:align-top overflow-clip">
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
                        <td className="*:float-left overflow-clip"><BuildingLink location={offering.meetings[0].building}/></td>
                    </tr>
                </table>
                {colorPicker}
            </Card>
        </div>
    );
}