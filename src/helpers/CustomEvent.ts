import moment from "moment";
import { CustomEvent } from "../types/CustomEvent";

export function newCustomEvent(): CustomEvent {
    return {
        id: -1,
        title: "",
        days: [false,false,false,false,false,false,false],
        startTime: moment('10:10 AM', 'hh:mm A').toString(),
        endTime: moment('2:50 PM', 'hh:mm A').toString(),
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