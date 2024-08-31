import { Course } from "./Course"
import { Final } from "./Final"
import { GradeDistributionCollection } from "./GradeDistributionCollection"
import { Instructor } from "./Instructor"
import { Meeting } from "./Meeting"
import { ParsedMeeting } from "./ParsedMeeting"
import { SectionInfo } from "./SectionInfo"

export type CourseOffering = {
    year: string
    quarter: string
    instructors: Instructor[]
    final_exam: string
    max_capacity: number
    meetings: Meeting[]
    num_section_enrolled: number
    num_total_enrolled: number
    num_new_only_reserved: number
    num_on_waitlist: number
    num_requested: number
    restrictions: string
    section: SectionInfo
    status: string
    units: string
    course: Course

    // Additional fields
    grades: GradeDistributionCollection
    parsed_meetings: ParsedMeeting[]
    final: Final | null
    color: string
}