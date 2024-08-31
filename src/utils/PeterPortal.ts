import { populateReviews } from "./RateMyProfessors";
import coursesJson from "../../src/assets/allCourses.json";
import { parseFinal, parseMeeting } from "./ParseMeeting";
import { getOfferingColor } from "./FullCalendar";
import { Course } from "../types/Course";
import { CourseOffering } from "../types/CourseOffering";
import { GradeDistribution } from "../types/GradeDistribution";
import { GradeDistributionCollection } from "../types/GradeDistributionCollection";

const courseMap = new Map<string, Course>((coursesJson as {data: {allCourses: Course[]}}).data.allCourses.map(course => [course.id, course]));

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

export type Query = {
    // Required:
    quarter: string
    year: string
    // At least one of:
    department?: string
    ge?: string
    section_codes?: string
    // Optional:
    number?: string
}

export function queryToString(query: Query) {
    if (!query) return "";
    return query.ge ? query.ge : query.department + (query.number ? ` ${query.number}` : "")
}

/**
 * Requests a schedule from the Peter Portal API with the given arguments.
 * @returns A list of courses representing the schedule.
 */
export async function requestSchedule(queries: Query[]): Promise<Course[]> {
    let numQueries = 0;

    const query =  `
        query {
            ${queries.map(query => {
                const {quarter, year, department, section_codes, number, ge} = query;
                const codes = (section_codes || "").split(",");
                // If no codes were provided, initialize with empty code chunk so at least one iteration happens.
                const codeChunks: string[][] = codes.length ? [] : [[]];
                // API has a limit of 10 codes per query.
                for (let i = 0; i < codes.length; i+=10) {
                    codeChunks.push(codes.slice(i, i + 10));
                }

                return codeChunks.map((section_codes) => `
                    schedule${numQueries++}: schedule(
                    quarter: "${quarter}" 
                    year: ${year}
                    ${department ? `department: "${department}"` : ""}
                    ${section_codes ? `section_codes: "${section_codes}"` : ""}
                    ${number ? `course_number: "${number}"` : ""}
                    ${ge ? `ge: "${ge}"` : ""}
                ) {
                    quarter year num_total_enrolled max_capacity num_on_waitlist num_new_only_reserved status restrictions final_exam units
                    meetings { time days building }
                    section { code type number }
                    instructors { shortened_name }
                    course { id department number title }
                }`).join("\n");
            })}
        }
    `;

    // The schedule query returns a list of course offerings.
    const offerings = [] as CourseOffering[];
    const response = await makeRequest(query);
    for (let i = 0; i < numQueries; ++i) {
        (response.data[`schedule${i}`] as CourseOffering[]).forEach(offering => {
            // Add offering if it is not a duplicate.
            if (!offerings.find(({quarter, year, section}) => (section.code === offering.section.code && quarter === offering.quarter && year === offering.year))) {
                offerings.push(offering);
            }
        });
    }
    const courseOfferings = new Map<string, CourseOffering[]>();
    offerings.forEach((offering) => {
        const course = offering.course;
        if (!course) return;

        const id = course.id;
        if (!courseOfferings.has(id)) {
            courseOfferings.set(id, []);
        }
        courseOfferings.get(id)!.push(offering);
    });

    // Process each course here.
    const courses = Array.from(courseOfferings.entries()).map(([id, offerings]) => {
        const course = {...courseMap.get(id)} as Course;
        course.offerings = offerings;                                                   // Attach offerings to course.
        course.prerequisite_list = course.prerequisite_list.filter(course => course);   // Filter null prerequisites.

        // Process each offering here.
        offerings.forEach(offering => {
            offering.course = {...course};
            offering.course.offerings = [];
            offering.parsed_meetings = offering.meetings.map(meeting => parseMeeting(meeting));     // Parse each meeting.
            offering.final = parseFinal(offering.final_exam);
            offering.color = getOfferingColor(offering);
        });

        return course;
    });

    (async () => {
        await populateGrades(courses);
        populateReviews(courses);
    })();

    return courses;
}

async function requestGrades(courses: Course[]) {
    const courseChunks = [] as Course[][];
    // Split courses into chunks so each query is under the payload limit.
    for (let i = 0; i < courses.length; i+=10) {
        courseChunks.push(courses.slice(i, i + 10));
    }

    const requests = [] as Promise<{data: GradeDistributionCollection}>[];
    const grades = {grade_distributions: [] as GradeDistribution[]} as GradeDistributionCollection;
    courseChunks.forEach(async (chunk) => {
        let index = 0;
        const query =  `
            query {
                ${chunk.map(({department, number}) => {
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
        const request = makeRequest(query)
        requests.push(request);

        const response = await request;
        for (let i = 0; i < chunk.length; ++i) {
            const courseGrades = response.data[`grades${i}`] as GradeDistributionCollection;
            courseGrades.grade_distributions.forEach(grade => grades.grade_distributions.push(grade));
        }
    });

    await Promise.all(requests);

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