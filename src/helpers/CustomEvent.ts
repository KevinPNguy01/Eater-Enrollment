import { CustomEvent } from "../types/CustomEvent";

export function newCustomEvent(): CustomEvent {
    return {
        id: -1,
        title: "",
        days: 0,
        startTime: "10:10 AM",
        endTime: "2:50 AM",
        location: "",
        description: ""
    } as CustomEvent;
}

export function customEventToString(event: CustomEvent): string {
    return JSON.stringify(event);
}

export function customEventFromString(s: string): CustomEvent {
    return JSON.parse(s);
}