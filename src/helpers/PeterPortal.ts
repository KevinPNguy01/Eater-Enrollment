import { Course, CourseOffering, GradeDistribution, GradeDistributionCollection } from "../constants/types";
import { populateReviews } from "./RateMyProfessors";

/**
 * Makes a request to the PeterPortal API.
 * @param query 
 * @returns The data fetched from the API.
 */
async function makeRequest(query: string) {
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({'query': query})
        }
    );
    return (await response.json());
}

interface ScheduleOptions {
    // Required:
    quarter: string,
    year: string,
    // At least one of:
    department?: string,
    section_codes?: string
    // Optional:
    number?: string,
    callBack?: () => void
}
/**
 * Requests a schedule from the Peter Portal API with the given arguments.
 * @returns A list of courses representing the schedule.
 */
export async function requestSchedule({quarter, year, department="", section_codes="", number="", callBack=()=>{}}: ScheduleOptions): Promise<Course[]> {
    const codes = section_codes.split(",");
    // If no codes were provided, initialize with empty code chunk so at least one iteration happens.
    const codeChunks: string[][] = codes.length ? [] : [[]];
    // API has a limit of 10 codes per query.
    for (let i = 0; i < codes.length; i+=10) {
        codeChunks.push(codes.slice(i, i + 10));
    }

    const query =  `
        query {
            ${codeChunks.map((section_codes, index) => `
                schedule${index}: schedule(
                quarter: "${quarter}" 
                year: ${year}
                ${department ? `department: "${department}"` : ""}
                ${section_codes ? `section_codes: "${section_codes}"` : ""}
                ${number ? `course_number: "${number}"` : ""}
            ) {
                quarter year num_total_enrolled max_capacity status restrictions
                meetings { time days building }
                section { code type number }
                instructors { shortened_name }
                course { id department number title }
            }`)}
        }
    `;

    // The schedule query returns a list of course offerings.
    const offerings = [] as CourseOffering[];
    const response = await makeRequest(query);
    for (let i = 0; i < codeChunks.length; ++i) {
        (response.data[`schedule${i}`] as CourseOffering[]).forEach(offering => {
            offerings.push(offering);
        });
    }
    const courseOfferings = new Map<string, CourseOffering[]>();
    offerings.forEach((offering) => {
        const course = offering.course;
        if (!course) return;

        const key = `${offering.course.id}\n${offering.course.department}\n${offering.course.number}\n${offering.course.title}`;
        if (!courseOfferings.has(key)) {
            courseOfferings.set(key, []);
        }
        courseOfferings.get(key)!.push(offering);
    });

    const courses = Array.from(courseOfferings.entries()).map(([courseString, offerings]) => {
        const [id, department, number, title] = courseString.split("\n");
        return {id: id, department: department, number: number, title: title, offerings: offerings} as Course;
    });

    (async () => {
        await populateGrades(courses);
        callBack();
        populateReviews(courses, callBack);
    })();

    return courses;
}

async function requestGrades(courses: Course[]) {
    let index = 0;
    const query =  `
        query {
            ${courses.map(({department, number}) => {
                return `
                    grades${index++}: grades (
                        ${department ? `department: "${department}"` : ""}
                        ${number ? `number: "${number}"` : ""}
                    ) {
                        grade_distributions{
                            average_gpa
                            grade_a_count
                            grade_b_count
                            grade_c_count
                            grade_d_count
                            grade_f_count
                            grade_p_count
                            grade_np_count
                            grade_w_count
                            course_offering {
                                course { department number }
                                section { type }
                                instructors {shortened_name }
                            }
                        }
                    }
                `;
            }).join("\n")}
        }
    `;
    const response = await makeRequest(query);
    const grades = {grade_distributions: [] as GradeDistribution[]} as GradeDistributionCollection;
    for (let i = 0; i < courses.length; ++i) {
        const courseGrades = response.data[`grades${i}`] as GradeDistributionCollection;
        courseGrades.grade_distributions.forEach(grade => grades.grade_distributions.push(grade));
    }
    return aggregatedGrades(grades);
}

const defaultGrades = () => {
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

const updateGradesCollection = (grades1: GradeDistributionCollection, grades2: GradeDistributionCollection) => {
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

function aggregatedGrades(grades: GradeDistributionCollection) {
    // A map of "<department> <number> <instructor>" to GradeDistributions.
    const grouped = new Map<string, GradeDistributionCollection>();

    grades.grade_distributions.forEach((distribution) => {
        const offering = distribution.course_offering;
        const course = offering.course;
        const instructor = offering.instructors[0].shortened_name;
        const key = `${course.department} ${course.number} ${instructor}`

        if (!grouped.has(key)) {
            grouped.set(key, defaultGrades());
        }
        updateGrades(grouped.get(key)!, distribution);

        const staffKey = `${course.department} ${course.number} STAFF`;
        if (!grouped.has(staffKey)) {
            grouped.set(staffKey, defaultGrades());
        }
        updateGrades(grouped.get(staffKey)!, distribution);
    });

    return grouped;
}

export async function populateGrades(courses: Course[]) {
    const offerings = courses.map(course => course.offerings).flat();
    const grades = await requestGrades(courses);
    offerings.forEach((offering) => {
        const course = offering.course;
        if (!course) return;

        const combinedGrades = defaultGrades();

        for (const instructor of offering.instructors) {
            const instructorGrades = grades.get(`${course.department} ${course.number} ${instructor.shortened_name}`.toUpperCase());
            if (instructorGrades && instructor.shortened_name !== "STAFF") {
                updateGradesCollection(combinedGrades, instructorGrades);
                combinedGrades.instructors.push(instructor.shortened_name)
            }
        }
        const staffGrades = grades.get(`${course.department} ${course.number} STAFF`.toUpperCase())
        if (staffGrades && !combinedGrades.instructors.length) updateGradesCollection(combinedGrades, staffGrades);
        offering.grades = combinedGrades;
    });
}