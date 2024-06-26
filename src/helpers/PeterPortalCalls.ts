import { Course, CourseOffering, GradeDistribution, GradeDistributionCollection } from "../constants/types";

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
}
export async function requestSchedule({quarter, year, department="", section_codes="", number=""}: ScheduleOptions) {
    const query =  `
        query {
            schedule(
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
            }
        }
    `;
    const offerings = (await makeRequest(query)).data.schedule as CourseOffering[];
    const grades = await requestGrades(department ? `${department},${number}` : offerings.map(({course}) => `${course.department},${course.number}`).join(";"));
    const courses = new Map<string, CourseOffering[]>();
    offerings.forEach((offering) => {
        const course = offering.course;
        if (!course) return;
        const staffGPA = grades.get(`${course.department} ${course.number} STAFF`.toUpperCase())
        if (staffGPA) offering.gpa = staffGPA;
        for (const instructor of offering.instructors) {
            if (instructor.shortened_name === "STAFF") continue;
            const gpa = grades.get(`${course.department} ${course.number} ${instructor.shortened_name}`.toUpperCase());
            if (gpa) offering.gpa = gpa;
        }

        const key = `${offering.course.id}\n${offering.course.department}\n${offering.course.number}\n${offering.course.title}`;
        if (!courses.has(key)) {
            courses.set(key, []);
        }
        courses.get(key)!.push(offering);
    });

    return Array.from(courses.entries()).map(([courseString, offerings]) => {
        const [id, department, number, title] = courseString.split("\n");
        return {id: id, department: department, number: number, title: title, offerings: offerings} as Course;
    });
}

async function requestGrades(courses: string) {
    const ids = Array.from(new Set(courses.split(";")));
    const query =  `
        query {
            ${ids.map((id, index) => {
                const [department, number] = id.split(",");
                return `
                    grades${index}: grades (
                        ${department ? `department: "${department}"` : ""}
                        ${number ? `number: "${number}"` : ""}
                    ) {
                        grade_distributions{
                            average_gpa
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
    for (let i = 0; i < ids.length; ++i) {
        const courseGrades = response.data[`grades${i}`] as GradeDistributionCollection;
        courseGrades.grade_distributions.forEach(grade => grades.grade_distributions.push(grade));
    }
    return aggregatedGrades(grades);
}

function aggregatedGrades(grades: GradeDistributionCollection) {
    const grouped = new Map<string, number[]>();
    grades.grade_distributions.forEach((distribution) => {
        const offering = distribution.course_offering;
        const course = offering.course;
        const key = `${course.department} ${course.number} ${offering.instructors[0].shortened_name}`
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(distribution.average_gpa);

        const staffKey = `${course.department} ${course.number} STAFF`;
        if (!grouped.has(staffKey)) {
            grouped.set(staffKey, []);
        }
        grouped.get(staffKey)!.push(distribution.average_gpa);
    });

    const aggregated = new Map<string, number>();
    grouped.forEach((gpas, key) => {
        aggregated.set(key, gpas.reduce((a, b) => a + b) / gpas.length);
    });

    return aggregated;
}