import moment from "moment";
import { CalendarEvent } from "types/CalendarEvent";
import { CourseOffering } from "types/CourseOffering";
import { CustomEvent } from "types/CustomEvent";

/**
 * Create event objects for the given custom events.
 * @param customEvents 
 * @returns An array of event objects that can be used by FullCalendar.
 */
export function createCustomEvents(customEvents: CustomEvent[]) {
    return customEvents.map(customEvent => {
        const events: CalendarEvent[] = [];
        for (let i = 0; i < 7; ++i) {
            if (customEvent.days & (1 << (6 - i))) {
                events.push({
                    title: customEvent.title,
                    start: moment(customEvent.startTime, 'hh:mm A').weekday(i).toISOString(),
                    end: moment(customEvent.endTime, 'hh:mm A').weekday(i).toISOString(),
                    id: `custom${customEvent.id}-${i}`,
                    backgroundColor: customEvent.color,
                    textColor: getTextColor(customEvent.color),
                    extendedProps: {
                        type: "CustomEvent",
                        source: customEvent
                    }
                })
            }
        }
        return events;
    }).flat();
}

/**
 * Create event objects for the given course offerings.
 * @param customEvents 
 * @returns An array of event objects that can be used by FullCalendar.
 */
export function createEvents(offerings: CourseOffering[]) {
    return offerings.filter(({ parsed_meetings }) => parsed_meetings[0]).map(offering => {
        const events: CalendarEvent[] = [];
        for (let i = 0; i < 7; ++i) {
            if (offering.parsed_meetings[0].days & (1 << (6 - i))) {
                events.push({
                    title: `${offering.course.department} ${offering.course.number} ${offering.section.type}`,
                    start: moment(offering.parsed_meetings[0].startTime, "hh:mm A").weekday(i).toISOString(),
                    end: moment(offering.parsed_meetings[0].endTime, "hh:mm A").weekday(i).toISOString(),
                    id: `${offering.quarter}-${offering.year}-${offering.section.code}-${i}`,
                    backgroundColor: offering.color,
                    textColor: getTextColor(offering.color),
                    extendedProps: {
                        type: "CourseOffering",
                        source: offering
                    }
                });
            }
        }
        return events;
    }).flat();
}

/**
 * Create event objects of the finals for the given course offerings.
 * @param customEvents 
 * @returns An array of event objects that can be used by FullCalendar.
 */
export function createFinalEvents(offerings: CourseOffering[]) {
    return offerings.filter(({ final }) => final).map(offering => {
        const final = offering.final!;
        return {
            title: `${offering.course.department} ${offering.course.number} Final`,
            start: moment(final.startTime, "hh:mm A").weekday(final.day).toISOString(),
            end: moment(final.endTime, "hh:mm A").weekday(final.day).toISOString(),
            id: `${offering.section.code}-1`,
            backgroundColor: offering.color,
            textColor: getTextColor(offering.color),
            extendedProps: {
                type: "CourseOffering",
                source: offering
            }
        };
    });
}

/**
 * @param s 
 * @returns A hex color from the given string's hash. 
 */
export function stringColor(s: string) {
    const hue = Math.abs(hashString(s) % 360);
    const saturation = 75;
    const lightness = 50;
    return hslToHex(hue, saturation, lightness);
}

/**
 * Generates a simple hash code for the given input string.
 * @param str The string to hash.
 * @returns The hash code of the string.
 */
function hashString(str: string) {
    return str.split('').reduce((hash, char) => (((hash << 5) - hash) + char.charCodeAt(0)), 0);
}

/**
 * Calculate what the text color should be given a hex color strubg.
 * @param hex 
 * @returns A hex color string.
 */
function getTextColor(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
}

function hslToHex(h: number, s: number, l: number) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {
        r: 0,
        g: 0,
        b: 0
    };
}