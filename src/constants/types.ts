export type SearchFields = {
    year: {value :string}
    term: {value: string}
}

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
    gpa: number
}
  
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

    // Optional:
    review: Review
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

export type GradeDistributionCollection = {
    aggregate: GradeDistributionCollectionAggregate
    grade_distributions: GradeDistribution[]
    instructors: string[]
}

export type GradeDistributionCollectionAggregate = {
    sum_grade_a_count: number
    sum_grade_b_count: number
    sum_grade_c_count: number
    sum_grade_d_count: number
    sum_grade_f_count: number
    sum_grade_p_count: number
    sum_grade_np_count: number
    sum_grade_w_count: number
    average_gpa: number
    count: number
}

export type GradeDistribution = {
    grade_a_count: number
    grade_b_count: number
    grade_c_count: number
    grade_d_count: number
    grade_f_count: number
    grade_p_count: number
    grade_np_count: number
    grade_w_count: number
    average_gpa: number
    course_offering: CourseOffering
}

export type Review = {
    firstName: string,
    lastName: string,
    department: string,
    avgRating: number,
    numRatings: number,
    wouldTakeAgainPercent: number,
    avgDifficulty: number,
    url: string
}