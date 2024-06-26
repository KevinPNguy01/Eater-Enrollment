import { CalendarApi } from "fullcalendar/index.js";
import { CourseOffering } from "../constants/types";

/**
 * Add the given CourseOfferings to the Calendar.
 */
export function addOfferingsToCalendar(offerings: CourseOffering[], calendar: CalendarApi | undefined) {
    offerings.forEach((offering) => {
        if (offering.meetings[0].time === "TBA") return;

        const course = offering.course;

        // Get the days of the week for this course offering.
        const days = offering.meetings[0].days;
        const dayOffsets = [];
        if (days.includes("M")) dayOffsets.push(0);
        if (days.includes("Tu")) dayOffsets.push(1);
        if (days.includes("W")) dayOffsets.push(2);
        if (days.includes("Th")) dayOffsets.push(3);
        if (days.includes("F")) dayOffsets.push(4);

        // Get the start and end times for this course offering.
        const [startTime, endTime] = parseTime(offering.meetings[0].time);
        const monday = getMonday();

        // Calculate color and luminance for event.
        const hue = hashString(`${course.id}${offering.section.type}`) % 360;
        const saturation = 75;
        const lightness = 50;
        const rgb = hslToRgb(hue/360, saturation/100, lightness/100);
        const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2])/255;

        // Add an event to the calendar for each meeting day.
        for (const days of dayOffsets) {
            startTime.setDate(monday.getDate() + days);
            endTime.setDate(monday.getDate() + days);
            calendar?.addEvent({
                title: `${course.department} ${course.number} ${offering.section.type}`,
                start: startTime.toISOString(),
                end: endTime.toISOString(),
                id: `${offering.section.code}-${days}`,
                backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                textColor: luminance > 0.5 ? "black" : "white"
            });
        } 
    });
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

/**
 * Generates a simple hash code for the given input string.
 * @param str The string to hash.
 * @returns The hash code of the string.
 */
function hashString(str: string) {
    return str.split('').reduce((hash, char) => (((hash << 5) - hash) + char.charCodeAt(0)), 0);
}

/**
 * 
 * @returns A Date object representing the monday of the current week.
 */
function getMonday() {
    const d = new Date();
    const day = d.getDay()
    const diff = d.getDate() - day + 1; // Adjust when day is sunday.
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    return new Date(d.setDate(diff));
}

/**
 * 
 * @param time The times to parse as a string.
 * @returns Two Date objects storing the start/end times represented by the given time string.
 */
function parseTime(time: string) {
    time = time.replace(/\s+/g, "");                        // Remove whitespace.
    const pm = time[time.length-1] === "p" ? true : false;  // The time ends past 12 if the string ends in 'p'.
    const timeArray = time.replace("p", "").split("-");     // Drop the p and split by '-' into two separate times.

    // Isolate the start/end hours and minutes.
    const startArray = timeArray[0].split(":");             
    const endArray = timeArray[1].split(":");
    let startHour = parseInt(startArray[0]);
    const startMinutes = parseInt(startArray[1]);
    let endHour = parseInt(endArray[0]);
    const endMinutes = parseInt(endArray[1]);

    // If the end time is in the pm, add 12 to the hours.
    if (pm) {
        startHour += 12;
        endHour += 12;
    }

    // Adjust for if the end time is actually at 12.
    if (endHour >= 24) {
        endHour = 12;
    }

    // Make sure start hour <= end hour.
    if (startHour > endHour) {
        startHour -= 12;
    }

    // Date object for the start time.
    const startTime = new Date();
    startTime.setHours(startHour);
    startTime.setMinutes(startMinutes);

    // Date object for the end time.
    const endTime = new Date(startTime);
    endTime.setHours(endHour);
    endTime.setMinutes(endMinutes);

    return [startTime, endTime]
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
    return [round(r * 255), round(g * 255), round(b * 255)];
}

function hueToRgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}