import { Course } from "./Course"
import { CustomEvent } from "./CustomEvent"

export type Schedule = {
    id: number
    name: string
    courses: Course[]
    customEvents: CustomEvent[]
}