import { useState, useContext, useEffect } from "react";
import { SketchPicker } from "react-color";
import { ScheduleContext } from "../../../app/App";
import { RateMyProfessorsLink } from "../../results/components/RateMyProfessorsLink";
import { Card, IconButton } from "@mui/material";
import { BuildingLink } from "../../results/components/BuildingLink";
import DeleteIcon from '@mui/icons-material/Delete';
import { EventImpl } from "@fullcalendar/core/internal";

function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
rgbToHex

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}
hexToRgb

export function EventInfo(props: {event: EventImpl, close: () => void, pos: {x: number, y: number}}) {
    const {event, close, pos} = props;
    const [colorVisible, setColorVisible] = useState(false);
    const [color, setColor] = useState(event.backgroundColor);
    const [r,g,b] = color.replace("rgb(", '').replace(')', '').split(',').map(num => parseInt(num));
    const [luminance, setLuminance] = useState((0.299 * r + 0.587 * g + 0.114 * b)/255);
    const {removeOffering, colorRules, setColorRules, addedCourses, scheduleIndex} = useContext(ScheduleContext);
    const offering = addedCourses[scheduleIndex].courses.map((course) => course.offerings).flat().find((offering) => offering.section.code === event.id.split("-")[0]);
    useEffect(() => {
        setColor(event.backgroundColor);
        const [r,g,b] = event.backgroundColor.replace("rgb(", '').replace(')', '').split(',').map(num => parseInt(num));
        setLuminance((0.299 * r + 0.587 * g + 0.114 * b)/255);
    }, [event]);
    if (!offering) return;
    const colorPicker = colorVisible ? 
        <SketchPicker 
            className="absolute -top-2 left-[110%]"
            color={color}
            onChange={color => {
                const {r, g, b} = color.rgb;
                setColor(color.hex);
                setLuminance((0.299 * r + 0.587 * g + 0.114 * b)/255);
                setColorRules(new Map([...colorRules, [`${offering.quarter} ${offering.year} ${offering.section.code}`, color.rgb]]));
            }}
        />
    : null;
    const spacerRow = <tr><td colSpan={2} className="border-b border-quaternary"></td></tr>;
    
    return (
        <div className="!overflow-visible absolute !z-[1000]" style={{top: `${pos.y}px`, left: `${pos.x}px`}}>
            <Card elevation={20} className="!overflow-visible !rounded-xl relative bg-tertiary">
                <div className="flex justify-between items-center bg-secondary p-2 gap-8 rounded-t-xl" 
                    style={{backgroundColor: color, color: luminance > 0.5 ? "black" : "white"}}
                >
                    <p className="font-semibold px-2">{`${offering.course.department} ${offering.course.number} ${offering.section.type}`}</p>
                    <IconButton color={luminance > 0.5 ? "black" : "white"} onClick={() => {
                        removeOffering(offering);
                        close();
                    }}>
                        <DeleteIcon/>
                    </IconButton>
                </div>
                <table className="border-spacing-x-4 border-separate py-3">
                    <tr className="border border-quaternary">
                        <td className="align-top text-sm text-right">Instructors</td>
                        <td><div className="grid justify-items-start *:align-top">
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
                        <td className="*:float-left"><BuildingLink location={offering.meetings[0].building}/></td>
                    </tr>
                    {spacerRow}
                    <tr>
                        <td className="!border-none"><p className="text-sm text-right">Color</p></td>
                        <td className="!border-none grid justify-items-start">
                            <button className="justify-self-start" onClick={() => setColorVisible(!colorVisible)}>
                            🎨
                            </button>
                        </td>
                    </tr>
                </table>
                {colorPicker}
            </Card>
        </div>
    );
}