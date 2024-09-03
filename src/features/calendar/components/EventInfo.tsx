import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PaletteIcon from '@mui/icons-material/Palette';
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import { EventClickArg } from "fullcalendar/index.js";
import { useEffect, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentScheduleIndex } from "stores/selectors/ScheduleSet";
import { changeCustomEventColor, changeOfferingColor, removeCustomEvent, removeOffering } from "stores/slices/ScheduleSet";
import { CourseOffering } from "types/CourseOffering";
import { CustomEvent } from "types/CustomEvent";
import useWindowDimensions from "utils/WindowDimensions";
import { BuildingLink } from "../../results/components/BuildingLink";
import { RateMyProfessorsLink } from "../../results/components/RateMyProfessorsLink";

export function EventInfo(
    { eventClickArg, eventClickArg: { event }, updateEvent, close, calendarRect, scrollPos }:
        { eventClickArg: EventClickArg, updateEvent: () => void, close: () => void, scrollPos: number, calendarRect: DOMRect }
) {
    const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
    const dispatch = useDispatch();

    const ref = useRef(null as unknown as HTMLDivElement);
    const colorPickerRef = useRef(null as unknown as HTMLDivElement);
    const screenSize = useWindowDimensions();

    // The source of this event.
    const type: string = event.extendedProps.type;
    const source: CourseOffering | CustomEvent = event.extendedProps.source;
    const offering = type === "CourseOffering" ? source as CourseOffering : null;
    const customEvent = type === "CustomEvent" ? source as CustomEvent : null;

    // Previous scroll position.
    const [lastScroll, setLastScroll] = useState(scrollPos);

    // Color of component, color picker, and event.
    const [backgroundColor, setBackgroundColor] = useState(event.backgroundColor);
    const [textColor, setTextColor] = useState(event.textColor);
    // Whether to show color picker.
    const [colorVisible, setColorVisible] = useState(false);

    // Where this component should be positioned.
    const [pos, setPos] = useState({ x: 0, y: 0 });
    // Where the color picker should be positioned.
    const [colorPickerPos, setColorPickerPos] = useState({ x: 0, y: 0 });

    /**
     * Reposition the EventInfo card relative to the selected calendar event.
     * Triggered whenever the selected event, component size, screen size, calendar size, or calendar scroll position changes.
     */
    useEffect(() => {
        const infoPos = calculatePosition(calendarRect, eventClickArg.el.getBoundingClientRect(), ref.current);
        setPos(infoPos);
        setColorPickerPos(calculateColorPickerPosition(calendarRect, ref.current, infoPos, colorPickerRef.current));
    },
        [eventClickArg, ref.current?.clientWidth, ref.current?.clientHeight, screenSize, calendarRect]
    );

    // Reposition on scroll.
    useEffect(() => {
        if (scrollPos != lastScroll) {
            setPos({ x: pos.x, y: pos.y + (lastScroll - scrollPos) })
            setLastScroll(scrollPos);
        }
    }, [scrollPos, lastScroll, pos.x, pos.y]);

    // Get the color and text color everytime the selected event changes.
    useEffect(() => {
        setBackgroundColor(event.backgroundColor);
        setTextColor(event.textColor);
    }, [event]);

    // Div containing the color picker.
    const colorPicker = (
        <Card
            elevation={3}
            className={`absolute bg-tertiary`}
            style={{ top: `${colorVisible ? colorPickerPos.y : calendarRect.bottom}px`, left: `${colorPickerPos.x}px` }}
            ref={colorPickerRef}
        >
            <SketchPicker
                className="!bg-tertiary [&_label]:!text-white"
                color={backgroundColor}
                onChange={color => {
                    const { r, g, b } = color.rgb;
                    setBackgroundColor(color.hex);
                    setTextColor((0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5 ? "#ffffff" : "#000000");

                }}
                onChangeComplete={color => {
                    if (customEvent) {
                        dispatch(changeCustomEventColor({ customEvent: event.extendedProps.source, color: color.hex, index: currentScheduleIndex }));
                    } else {
                        dispatch(changeOfferingColor({ offering: offering!, color: color.hex, index: currentScheduleIndex }));
                    }
                }}
            />
        </Card>
    );

    const spacerRow = <tr><td colSpan={2} className="border-b border-quaternary"></td></tr>;
    return (
        <div
            className={`${!pos.x ? "opacity-0" : ""} !overflow-visible absolute !z-10`}
            style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
            onClick={e => e.stopPropagation()}
            ref={ref}
        >
            {/** Card is positioned so color picker can be positioned relative to it. */}
            <Card elevation={3} className="!overflow-visible !rounded-xl relative bg-tertiary">
                {/** Title and buttons */}
                <div
                    className="flex justify-between items-center bg-secondary p-2 gap-8 rounded-t-xl"
                    style={{ backgroundColor: backgroundColor, color: textColor }}
                >
                    {/** Title */}
                    <p className="font-semibold px-2 text-nowrap">{event.title}</p>
                    {/** Buttons */}
                    <div className="flex">
                        {/** Edit event (Only for custom events). */}
                        {customEvent && (
                            <IconButton color={textColor === "#000000" ? "black" : "white"} onClick={() => {
                                updateEvent();
                                close();
                            }}>
                                <EditIcon />
                            </IconButton>
                        )}
                        {/** Toggle color picker visibility. */}
                        <IconButton color={textColor === "#000000" ? "black" : "white"} onClick={() => {
                            setColorPickerPos(calculateColorPickerPosition(calendarRect, ref.current, pos, colorPickerRef.current));
                            setColorVisible(!colorVisible)
                        }}>
                            <PaletteIcon />
                        </IconButton>
                        {/** Delete event. */}
                        <IconButton color={textColor === "#000000" ? "black" : "white"} onClick={() => {
                            if (customEvent) {
                                dispatch(removeCustomEvent({ customEvent, index: currentScheduleIndex }));
                            } else {
                                dispatch(removeOffering({ offering: offering!, index: currentScheduleIndex }));
                            }
                            close();
                        }}>
                            <DeleteIcon />
                        </IconButton>
                    </div>
                </div>
                <table className="border-spacing-x-4 border-separate py-3"><tbody>
                    {offering ? (
                        <tr className="border border-quaternary w-full">
                            {/** List of instructors. */}
                            <td className="align-top text-sm text-right">Instructors</td>
                            <td className="w-full">
                                <div className="grid justify-items-start *:align-top *:!overflow-clip">
                                    {offering!.instructors.map(
                                        (instructor, index) => {
                                            return <RateMyProfessorsLink key={index} instructor={instructor} />
                                        }
                                    )}
                                </div>
                            </td>
                        </tr>
                    ) : (
                        <tr>
                            {/** Custom event description. */}
                            <td className="text-sm text-right">Description</td>
                            <td className="align-top w-full">{event.extendedProps.source.description}</td>
                        </tr>
                    )}
                    {spacerRow}
                    <tr>
                        {/** Location of event. */}
                        <td className="text-sm text-right">Location</td>
                        <td className="*:float-left *:!overflow-clip">
                            {<BuildingLink location={offering ? offering.meetings[0].building : customEvent!.location + " "} />}
                        </td>
                    </tr>
                </tbody></table>
                {colorPicker}
            </Card>
        </div>
    );
}

const calculatePosition = (calendarRect: DOMRect, eventRect: DOMRect, infoCard: HTMLDivElement) => {
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
    const { clientHeight: infoHeight, clientWidth: infoWidth } = infoCard;

    // Default position: To the right of the event, centered vertically.
    let x = eventLeft + eventWidth + 5;
    let y = eventTop - calendarTop + eventHeight / 2 - infoHeight / 2;
    // If the component overflows to the right of the calendar, position it to the left of the event.
    if (x + infoWidth > calendarWidth) {
        x = eventLeft - infoWidth - 10;
        // If the component overflows to the left of the calendar, position it below the event, centered horizontally.
        if (x < 0) {
            x = Math.max(5, eventLeft + eventWidth / 2 - infoWidth / 2);
            y = eventBottom - calendarTop + 5;
            // If the component overflows to the right, try sticking to right, then left.
            if (x + infoWidth > calendarWidth) {
                x = Math.max(5, calendarWidth - infoWidth - 5);
            }
            // If the component overflows to the bottom, position it above the event.
            if (y + infoHeight > calendarHeight) {
                y = Math.max(5, eventTop - calendarTop - infoHeight - 5);
            }
        }
    }
    return { x, y };
}

const calculateColorPickerPosition = (calendarRect: DOMRect, infoCard: HTMLDivElement, infoPos: { x: number, y: number }, colorPicker: HTMLDivElement) => {
    const { height: calendarHeight } = calendarRect;
    const { clientHeight: infoHeight, clientWidth: infoWidth } = infoCard;
    const { y: infoY } = infoPos;
    const { clientHeight: pickerHeight, clientWidth: pickerWidth } = colorPicker;

    // Default position: Below the EventInfo card, centered horizontally.
    const x = infoWidth / 2 - pickerWidth / 2;
    let y = infoHeight + 10;

    // If the color picker clips past the bottom, position it above the EventInfo card.
    if (infoY + infoHeight + 10 + pickerHeight > calendarHeight) {
        y = -5 - pickerHeight;
    }

    return { x, y };
}