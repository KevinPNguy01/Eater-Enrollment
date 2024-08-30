import { CustomEvent } from "../constants/Types";

export function customEventToString(event: CustomEvent): string {
    const {id, title, startTime, endTime, days, color} = event;
    const daysString = days.map(val => val ? "1" : "0").join("");
    return `${id} ${title} ${startTime} ${endTime} ${daysString} ${color}`;
}

export function customEventFromString(s: string): CustomEvent {
    const [id, title, startTime, endTime, days, color] = s.split(" ");
    return {
        id: parseInt(id),
        title: title,
        startTime: startTime,
        endTime: endTime,
        days: days.split("").map(char => char === "1"),
        color: color
    };
}