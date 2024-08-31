import { CourseOffering } from "../constants/Types";
import { CustomEvent } from "../constants/Types";
import moment from "moment";

export function createCustomEvents(customEvents: CustomEvent[]) {
    return customEvents.map(customEvent => {
        const events: { backgroundColor: string; textColor: string; title: string; start: string; end: string; id: string; description: string}[] = [];
        for (let i = 0; i < 7; ++i) {
            if (customEvent.days[i]) {
                events.push({
                    title: customEvent.title,
                    start: moment(customEvent.startTime).weekday(i).toISOString(),
                    end: moment(customEvent.endTime).weekday(i).toISOString(),
                    id: `custom${customEvent.id}-${i}`,
                    backgroundColor: customEvent.color,
                    textColor: getTextColor(customEvent.color),
                    description: customEvent.description
                })
            }
        }
        return events;
    }).flat();
}

export function createEvents(offerings: CourseOffering[]) {
    return offerings.filter(({parsed_meetings}) => parsed_meetings[0].time).map(offering => {
        // Add an event to the calendar for each meeting day.
        const events = [];
        for (let i = 4; i >= 0; --i) {
            const day = offering.parsed_meetings[0].days & (1 << i) ? 4 - i : null;
            if (day === null) continue;
            const [startTime, endTime] = offering.parsed_meetings[0].time!.map(s => new Date(s));
            const [startDate, endDate] = [getDay(day), getDay(day)];
            startDate.setHours(startTime.getHours(), startTime.getMinutes());
            endDate.setHours(endTime.getHours(), endTime.getMinutes());
            events.push({
                title: `${offering.course.department} ${offering.course.number} ${offering.section.type}`,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                id: `${offering.section.code}-${day}`,
                backgroundColor: offering.color,
                textColor: getTextColor(offering.color)
            });
        }
        return events;
    }).flat();
}

export function createFinalEvents(offerings: CourseOffering[]) {
    return offerings.filter(({final}) => final && final.time).map(offering => {
        const final = offering.final!;
        const [startDate, endDate] = [getDay(final.day), getDay(final.day)];
        const [startTime, endTime] = final.time!.map(s => new Date(s));
        startDate.setHours(startTime.getHours(), startTime.getMinutes());
        endDate.setHours(endTime.getHours(), endTime.getMinutes());
        return {
            title: `${offering.course.department} ${offering.course.number} Final`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            id: `${offering.section.code}-1`,
            backgroundColor: offering.color,
            textColor: getTextColor(offering.color)
        };
    });
}

export function getOfferingColor(offering: CourseOffering) {
    const {course} = offering;

    // Calculate color and luminance for event.
    const hue = Math.abs(hashString(`${course.id}${offering.section.type}`)) % 360;
    const saturation = 75;
    const lightness = 50;
    return hslToHex(hue, saturation, lightness);
}

export function getColorCustomEvent(customEvent: CustomEvent) {
    // Calculate color and luminance for event.
    const hue = Math.abs(hashString(customEvent.title)) % 360;
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
 * @param
 * @returns A Date object representing a day on the calendar of the current week.
 */
function getDay(days: number) {
    const d = new Date();
    const day = d.getDay()
    const diff = d.getDate() - day + days + 1;
    return new Date(d.setDate(diff));
}

function getTextColor(hex: string) {
    const {r, g, b} = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b)/255;
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