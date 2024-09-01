import { CourseOffering } from "./CourseOffering"
import { CustomEvent } from "./CustomEvent"

export type CalendarEvent = {
    title: string
    start: string
    end: string
    id: string
    backgroundColor: string
    textColor: string
    extendedProps: {
        type: "CourseOffering" | "CustomEvent"
        source: CourseOffering | CustomEvent
    }
}