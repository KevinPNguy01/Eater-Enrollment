import { CourseOffering } from "./CourseOffering"

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