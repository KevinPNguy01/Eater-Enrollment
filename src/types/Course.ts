import { CourseOffering } from "./CourseOffering";
import { Instructor } from "./Instructor";

export type Course = {
    id: string
    department: string
    number: string
    school: string
    title: string
    course_level: string
    department_alias: string[]
    units: number[]
    description: string
    department_name: string
    instructor_history: Instructor[]
    prerequisite_tree: string
    prerequisite_list: Course[]
    prerequisite_text: string
    prerequisite_for: Course[]
    repeatability: string
    concurrent: string
    same_as: string
    restriction: string
    overlap: string
    corequisite: string
    ge_list: string[]
    ge_text: string
    terms: string[]
    offerings: CourseOffering[]
};