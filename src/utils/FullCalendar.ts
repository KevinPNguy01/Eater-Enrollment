import { CalendarApi } from "fullcalendar/index.js";
import { CourseOffering } from "../constants/Types";
import { RGBColor } from "react-color";

/**
 * Add the given CourseOfferings to the Calendar.
 */
export function addOfferingsToCalendar(offerings: CourseOffering[], calendar: CalendarApi | undefined, colorRules: Map<string, RGBColor>, final: boolean) {
    const events = (final ? createFinalEvents : createEvents)(offerings, colorRules);
    events.forEach(event => calendar?.addEvent(event));
}

function createEvents(offerings: CourseOffering[], colorRules: Map<string, RGBColor>) {
    return offerings.filter(({parsed_meetings}) => parsed_meetings[0].time).map(offering => {
        // Add an event to the calendar for each meeting day.
        const events = [];
        for (let i = 4; i >= 0; --i) {
            const day = offering.parsed_meetings[0].days & (1 << i) ? i : null;
            if (day === null) continue;
            const [startTime, endTime] = offering.parsed_meetings[0].time!;
            const [startDate, endDate] = [getDay(day), getDay(day)];
            startDate.setHours(startTime.getHours(), startTime.getMinutes());
            endDate.setHours(endTime.getHours(), endTime.getMinutes());
            events.push({
                title: `${offering.course.department} ${offering.course.number} ${offering.section.type}`,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                id: `${offering.section.code}-${day}`,
                ...getColor(offering, colorRules)
            });
        }
        return events;
    }).flat();
}

/**
 * Remove the given CourseOfferings to the Calendar.
 */
export function removeOfferingsFromCalendar(offerings: CourseOffering[], calendar: CalendarApi | undefined) {
    offerings.forEach((offering) => {
        // Remove events with matching section codes from the calendar.
		for (let i = 0; i < 5; ++i) {
			const event = calendar?.getEventById(`${offering.section.code}-${i}`);
			if (event) event.remove()
		}
    });
}

function createFinalEvents(offerings: CourseOffering[], colorRules: Map<string, RGBColor>) {
    return offerings.filter(({final}) => final && final.time).map(offering => {
        const final = offering.final!;
        const [startDate, endDate] = [getDay(final.day), getDay(final.day)];
        const [startTime, endTime] = final.time!;
        startDate.setHours(startTime.getHours(), startTime.getMinutes());
        endDate.setHours(endTime.getHours(), endTime.getMinutes());
        return {
            title: `${offering.course.department} ${offering.course.number} ${offering.section.type}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            id: `${offering.section.code}-1`,
            ...getColor(offering, colorRules)
        };
    });
}

export function getColor(offering: CourseOffering, colorRules: Map<string, RGBColor>) {
    const {course} = offering;

    // Calculate color and luminance for event.
    const hue = hashString(`${course.id}${offering.section.type}`) % 360;
    const saturation = 75;
    const lightness = 50;
    const rgb = colorRules.get(`${offering.quarter} ${offering.year} ${offering.section.code}`) || hslToRgb(hue/360, saturation/100, lightness/100);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b)/255;

    return {
        backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        textColor: luminance > 0.5 ? "black" : "white"
    }
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
    const diff = d.getDate() - day + 1 + days + (day === 6 ? 7 : 0); // Adjust when day is saturday.
    return new Date(d.setDate(diff));
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h: number, s: number, l: number) {
    const { round } = Math;
    let r, g, b;
  
    if (s === 0) {
        r = g = b = l; // achromatic    
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1/3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1/3);
    }
    return {r: round(r * 255), g: round(g * 255), b: round(b * 255)} as RGBColor;
}

function hueToRgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}