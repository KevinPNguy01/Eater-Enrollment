import FullCalendar from "@fullcalendar/react";
import { CalendarApi } from "fullcalendar/index.js";
import { useState, useContext } from "react";
import { RGBColor, SketchPicker } from "react-color";
import { ScheduleContext } from "../../../app/App";
import { CourseOffering } from "../../../constants/Types";
import { RateMyProfessorsLink } from "../../results/components/RateMyProfessorsLink";

export function EventInfo(props: {offering: CourseOffering, setOffering: (offering: CourseOffering) => void, pos: {x: number, y: number}}) {
    const [colorVisible, setColorVisible] = useState(false);
    const [color, setColor] = useState({} as RGBColor)
    const {removeOffering, calendarReference, colorRules, setColorRules} = useContext(ScheduleContext);
    const {offering, setOffering, pos} = props;
    return (
        <div className="absolute bg-tertiary p-2 border border-quaternary z-10 event-info" style={{top: `${pos.y}px`, left: `${pos.x}px`}}>
            <table className="relative">
                <tbody>
                    <tr>
                        <td>
                            {`${offering.course.department} ${offering.course.number} ${offering.section.type}`}
                        </td>
                        <td>
                            <button onClick={() => {
                                removeOffering(offering);
                                setOffering(null as unknown as CourseOffering);
                            }}>
                                🗑
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td className="whitespace-pre">{"Instructors\t\t"}</td>
                        <td>
                            {offering.instructors.map(
                                (instructor) => {
                                    return <RateMyProfessorsLink instructor={instructor}/>
                                }
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>Capacity</td>
                        <td>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td>{offering.status}</td>
                    </tr>
                    <tr>
                        <td>Code</td>
                        <td>
                            {offering.section.code}
                        </td>
                    </tr>
                    <tr>
                        <td>Color</td>
                        <td>
                            <button onClick={() => setColorVisible(!colorVisible)}>
                                🎨
                            </button>
                            {colorVisible ? 
                                (
                                    <SketchPicker 
                                        className="absolute -top-2 left-[110%]"
                                        color={color}
                                        onChange={color => {
                                            const calendar = (calendarReference.current! as InstanceType<typeof FullCalendar>)?.getApi() as CalendarApi;
                                            const rgb = color.rgb
                                            for (let i = 0; i <  5; ++i) {
                                                const event = calendar.getEventById(`${offering.section.code}-${i}`);
                                                event?.setProp("backgroundColor", color.hex);
                                                event?.setProp("textColor", (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b)/255 > 0.5 ? "black" : "white")
                                            }
                                            setColor(color.rgb);
                                        }}
                                        onChangeComplete={color => {
                                            colorRules.set(`${offering.quarter} ${offering.year} ${offering.section.code}`, color.rgb);
                                            setColorRules(new Map(colorRules));
                                        }}
                                    />
                                ) : null}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}