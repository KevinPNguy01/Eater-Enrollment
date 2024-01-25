export const navLinks = [
  {
    id: "calendar",
    title: "Calendar",
  },
  {
    id: "search",
    title: "Search",
  },
  {
    id: "added",
    title: "Added",
  },
  {
    id: "combinations",
    title: "Combinations",
  }
];

export type CourseOffering = {
  year: string
  quarter: string
  instructors: [Instructor]
  final_exam: string
  max_capacity: number
  meetings: [Meeting]
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
  }

export type Course = {
  id: string
  department: string
  number: string
  school: string
  title: string
  course_level: string
  department_alias: [string]
  units: [number]
  description: string
  department_name: string
  instructor_history: [Instructor]
  prerequisite_tree: string
  prerequisite_list: [Course]
  prerequisite_text: string
  prerequisite_for: [Course]
  repeatability: string
  concurrent: string
  same_as: string
  restriction: string
  overlap: string
  corequisite: string
  ge_list: [string]
  ge_text: string
  terms: [string]
  offerings: [CourseOffering]
};

export type Instructor = {
  name: string
  shortened_name: string
  ucinetid: string
  email: string
  title: string
  department: string
  schools: [string]
  related_departments: [string]
  course_history: [Course]
};

export type Meeting = {
  building: string
  days: string
  time: string
};

export type SectionInfo = {
  code: string
  comment: string
  number: string
  type: string
};