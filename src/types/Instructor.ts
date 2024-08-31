import { Course } from "./Course";
import { Review } from "./Review";

export type Instructor = {
    name: string
    shortened_name: string
    ucinetid: string
    email: string
    title: string
    department: string
    schools: string[]
    related_departments: string[]
    course_history: Course[]

    // Additional fields
    review: Review
};