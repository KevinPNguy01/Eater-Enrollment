import { GradeDistribution } from "types/GradeDistribution";
import { GradeDistributionCollection } from "types/GradeDistributionCollection";

export const newGradeDistributionCollection = () => {
    return {
        aggregate: {
            sum_grade_a_count: 0,
            sum_grade_b_count: 0,
            sum_grade_c_count: 0,
            sum_grade_d_count: 0,
            sum_grade_f_count: 0,
            sum_grade_np_count: 0,
            sum_grade_p_count: 0,
            sum_grade_w_count: 0,
            average_gpa: 0,
            count: 0
        },
        instructors: [] as string[]
    } as GradeDistributionCollection;
}

const updateGrades = (avgGrades: GradeDistributionCollection, grades: GradeDistribution) => {
    avgGrades.aggregate.sum_grade_a_count += grades.grade_a_count;
    avgGrades.aggregate.sum_grade_b_count += grades.grade_b_count;
    avgGrades.aggregate.sum_grade_c_count += grades.grade_c_count;
    avgGrades.aggregate.sum_grade_d_count += grades.grade_d_count;
    avgGrades.aggregate.sum_grade_f_count += grades.grade_f_count;
    avgGrades.aggregate.sum_grade_p_count += grades.grade_p_count;
    avgGrades.aggregate.sum_grade_np_count += grades.grade_np_count;
    avgGrades.aggregate.sum_grade_w_count += grades.grade_w_count;
    avgGrades.aggregate.average_gpa = (avgGrades.aggregate.average_gpa * avgGrades.aggregate.count + grades.average_gpa) / (avgGrades.aggregate.count + 1);
    avgGrades.aggregate.count += 1;
}

export const updateGradesCollection = (grades1: GradeDistributionCollection, grades2: GradeDistributionCollection) => {
    const g1 = grades1.aggregate;
    const g2 = grades2.aggregate
    g1.sum_grade_a_count += g2.sum_grade_a_count;
    g1.sum_grade_b_count += g2.sum_grade_b_count;
    g1.sum_grade_c_count += g2.sum_grade_c_count;
    g1.sum_grade_d_count += g2.sum_grade_d_count;
    g1.sum_grade_f_count += g2.sum_grade_f_count;
    g1.sum_grade_p_count += g2.sum_grade_p_count;
    g1.sum_grade_np_count += g2.sum_grade_np_count;
    g1.sum_grade_w_count += g2.sum_grade_w_count;
    g1.average_gpa = (g1.average_gpa * g1.count + g2.average_gpa * g2.count) / (g1.count + g2.count);
    g1.count += 1;
}

/**
 * Aggregate all the GradeDistributions into an object.
 * @param grades 
 * @returns
 */
export function aggregatedGrades(grades: GradeDistributionCollection) {
    const grouped = {} as Record<string, Record<string, GradeDistributionCollection>>;

    // Go through every instructor of every grade distribution.
    grades.grade_distributions.forEach((distribution) => {
        const offering = distribution.course_offering;
        const course = offering.course;

        // Create Record of grades for each course.
        const courseKey = `${course.department} ${course.number}`;
        if (!grouped[courseKey]) {
            grouped[courseKey] = {} as Record<string, GradeDistributionCollection>;
        }
        const courseGrades = grouped[courseKey];

        offering.instructors.forEach(({ shortened_name: instructor }) => {
            // Update grades for instructor.
            if (!courseGrades[instructor]) {
                courseGrades[instructor] = newGradeDistributionCollection();
            }
            updateGrades(courseGrades[instructor], distribution);

            // Update grades for average/unspecified instructor.
            if (!courseGrades["STAFF"]) {
                courseGrades["STAFF"] = newGradeDistributionCollection();
            }
            updateGrades(courseGrades["STAFF"], distribution);
        });
    });

    return grouped;
}