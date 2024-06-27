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
        (response.data[`schedule${i}`] as CourseOffering[]).forEach(offering => offerings.push(offering));
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

export async function populateGrades(courses: Course[]) {
    const offerings = courses.map(course => course.offerings).flat();
    const grades = await requestGrades(courses);
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
    });
}