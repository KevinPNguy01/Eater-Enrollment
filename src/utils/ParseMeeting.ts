import { Final, Meeting, ParsedMeeting } from "../constants/Types";
import { buildingIds } from "../features/map/constants/BuildingIds";

export function parseMeeting(meeting: Meeting): ParsedMeeting {
    const [buildingId, room] = parseBuilding(meeting.building);
    const days = parseDays(meeting.days);
    const time = parseTime(meeting.time);
    return {buildingId, room, days, time}
}

/**
 * @param time The times to parse as a string.
 * @returns A tuple of numbers representing the start/end times represented by the given time string.
 */
function parseTime(time: string): [string, string] | null {
    if (!time || time === "TBA") return null;    // Account for asynchronous meeting times.

    time = time.replace(/\s+/g, "").replace("am", "").replace("pm", "p")    // Normalize string.
    const pm = time[time.length-1] === "p" ? true : false;                  // The time ends past 12 if the string ends in 'p'.
    const timeArray = time.replace("p", "").split("-");                     // Drop the p and split by '-' into two separate times.

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

    const startTime = new Date();
    const endTime = new Date();
    startTime.setHours(startHour, startMinutes);
    endTime.setHours(endHour, endMinutes);
    return [startTime.toISOString(), endTime.toISOString()];
}

/**
 * @param location The building and room number to parse as a string.
 * @returns A tuple of the building object and room number string represented by the given string.
 */
function parseBuilding(location: string): [number, string] {
    const tokens = location.split(" ");
    const code = tokens.slice(0, -1).join(" ");
    const number = tokens[tokens.length-1];
    const id = buildingIds[code];
    return [id, number]
}

/**
 * @param days The meeting days to parse a string.
 * @returns A bit vector where each bit set represents meeting that day.
 */
function parseDays(days: string): number {
    let dayBits = 0;
    if (days.includes("M")) dayBits |= 0b10000;
    if (days.includes("Tu")) dayBits |= 0b01000;
    if (days.includes("W")) dayBits |= 0b00100;
    if (days.includes("Th")) dayBits |= 0b00010;
    if (days.includes("F")) dayBits |= 0b00001;
    return dayBits;
}

export function parseFinal(final: string): Final | null {
    const days: Record<string, number> = {
        Sat: -2,
        Sun: -1,
        Mon: 0,
        Tue: 1,
        Wed: 2,
        Thu: 3,
        Fri: 4,
    };
    const [dayString, monthString, dateNumber, timeString] = final.split(" ");
    const day = days[dayString];
    const time = parseTime(timeString);
    if (!time) return null;
    const [startTime, endTime] = [new Date(time[0]), new Date(time[1])];
    const start = new Date(`${dateNumber} ${monthString} ${new Date().getFullYear()}`);
    const end = new Date(start);
    startTime.setMonth(start.getMonth(), start.getDate());
    endTime.setMonth(end.getMonth(), end.getDate());
    return {time: [startTime.toISOString(), endTime.toISOString()], day};
}