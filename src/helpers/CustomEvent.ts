import { CustomEvent } from "../types/CustomEvent";

export function customEventToString(event: CustomEvent): string {
    return JSON.stringify(event);
}

export function customEventFromString(s: string): CustomEvent {
    return JSON.parse(s);
}