import { Course, CourseOffering, GradeDistributionCollection } from "../../../constants/types";
import courses from "../../../assets/allCourses.json";

const departments = Array.from(
    new Map(courses.data.allCourses.map(
        (course) => [course.department, course.department_name]
    )).entries()
).map(
    ([department, department_name]) => {return {
        department: department,
        number: "",
        title: department_name,
        department_name: department_name
    }}
);

const coursesAndDepartments = departments.concat(courses.data.allCourses);

export async function getCourse(term: string, year: string, department: string, number: string) {
    const query: string = buildQuery(term, year, department, number);
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({'query': query})
        }
    );
    const grades = await getDepartmentGrades(department);
    const course = (await response.json()).data.course as Course;
    course.offerings.forEach((offering) => {
        if (!course) return;
        for (const instructor of offering.instructors) {
            const key = `${course.department} ${course.number} ${instructor.shortened_name}`.toUpperCase();
            const gpa = grades.get(key);
            if (gpa && instructor.shortened_name !== "STAFF") {
                offering.gpa = gpa;
                break;
            }
        }
        const staffGPA = grades.get(`${course.department} ${course.number} STAFF`.toUpperCase())
        if (!offering.gpa && staffGPA) {
            offering.gpa = staffGPA;
        }
    });
    return course;
}

function buildQuery(term: string, year: string, department: string, number: string) {
    const sectionSelection = `section{code type number}`;
    const instructorSelection = `instructors{shortened_name}`
    const meetingsSelection = `meetings{time days building}`
    const offeringsConstructor = `offerings(quarter:"${term}" year:${year})`;
    const offeringsSelection = `{quarter year restrictions status ${meetingsSelection} ${instructorSelection} num_total_enrolled max_capacity ${sectionSelection}}`;
    const offeringsQuery = `${offeringsConstructor} ${offeringsSelection}`;
    const courseConstructor = `course(id:"${(department+number+"").replace(" ", "")}")`;
    const courseSelection = `{id department number title ${offeringsQuery}}`;
    const query: string = `query { ${courseConstructor} ${courseSelection} }`;
    return query;
}

export async function getSchedule(term: string, year: string, department: string) {

    const query: string = buildScheduleQuery(term, year, department);
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({'query': query})
        }
    );    
    const grades = await getDepartmentGrades(department);
    const offerings = (await response.json()).data.schedule as CourseOffering[];

    offerings.forEach((offering) => {
        const course = offering.course;
        if (!course) return;
        for (const instructor of offering.instructors) {
            const key = `${course.department} ${course.number} ${instructor.shortened_name}`.toUpperCase();
            const gpa = grades.get(key);
            if (gpa && instructor.shortened_name !== "STAFF") {
                offering.gpa = gpa;
                break;
            }
        }
        const staffGPA = grades.get(`${course.department} ${course.number} STAFF`.toUpperCase())
        if (!offering.gpa && staffGPA) {
            offering.gpa = staffGPA;
        }
    });

    return offerings;
}

function buildScheduleQuery(term: string, year: string, department: string) {
    const scheduleConstructor = `schedule(quarter:"${term}" year:${year} department:"${department}")`
    const sectionSelection = `section{code type number}`;
    const instructorSelection = `instructors{shortened_name}`
    const meetingsSelection = `meetings{time days building}`
    const courseSelection = `course{id department number title}`;
    const offeringSelection = `{quarter year restrictions status ${meetingsSelection} ${instructorSelection} num_total_enrolled max_capacity ${sectionSelection} ${courseSelection}}`;
    const query: string = `query { ${scheduleConstructor} ${offeringSelection} }`;
    return query;
}

export async function getCourseByCode(term: string, year: string, code: string) {
    const query: string = buildQueryByCode(term, year, code);
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({'query': query})
        }
    );
    const offerings = (await response.json()).data.schedule as CourseOffering[];
    offerings.forEach(async (offering) => {
        const course = offering.course;
        const grades = await getDepartmentGrades(course.department)
        if (!course) return;
        for (const instructor of offering.instructors) {
            const key = `${course.department} ${course.number} ${instructor.shortened_name}`.toUpperCase();
            const gpa = grades.get(key);
            if (gpa && instructor.shortened_name !== "STAFF") {
                offering.gpa = gpa;
                break;
            }
        }
        const staffGPA = grades.get(`${course.department} ${course.number} STAFF`.toUpperCase())
        if (!offering.gpa && staffGPA) {
            offering.gpa = staffGPA;
        }
    });
    return offerings;
}

function buildQueryByCode(term: string, year: string, code: string) {
    const sectionSelection = `section{code type number}`;
    const instructorSelection = `instructors{shortened_name}`
    const meetingsSelection = `meetings{time days building}`
    const courseSelection = `course{id department number title}`;
    const offeringSelection = `{quarter year restrictions status ${meetingsSelection} ${instructorSelection} num_total_enrolled max_capacity ${sectionSelection} ${courseSelection} }`;
    const scheduleConstructor = `schedule(quarter:"${term}" year:${year} section_codes:"${code}")`;
    const query: string = `query { ${scheduleConstructor} ${offeringSelection} }`;
    return query;
}

export function autoSuggest(searchStr: string, setCourseSuggestions: (list: {department: string, number: string, title: string}[]) => void) {
    const regExp = buildRegExp(searchStr);
    setCourseSuggestions(new Array<Course>());
    if (searchStr.length > 2) setCourseSuggestions(coursesAndDepartments.filter(
        course => (regExp.test(` ${course.department} ${course.number}: ${course.title}`.toLowerCase())))
    );
}

function buildRegExp(searchStr: string) {
    let regExpStr = "";
    for (const word of searchStr.toLowerCase().split(" ")) {
        regExpStr += ".* "
        for (const c of word) {
            regExpStr += c;
            if ('0' > c || c > '9') regExpStr += ".?";
        }
    }
    return new RegExp(regExpStr);
}

export async function getDepartmentGrades(department: string) {
    const query = `
        query {
            grades(department: "${department}") {
                grade_distributions{
                    average_gpa
                    course_offering {
                        course { department number }
                        section { type }
                        instructors {shortened_name }
                    }
                }
            }
        }
    `;
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({'query': query})
        }
    );
    const grades = (await response.json()).data.grades as GradeDistributionCollection;
    return aggregatedGrades(grades);
}

export async function getCourseGrades(department: string, number: string) {
    const query = `
        query {
            grades(department: "${department}" number: "${number}") {
                grade_distributions{
                    average_gpa
                    course_offering {
                        course { department number }
                        section { type }
                        instructors {shortened_name }
                    }
                }
            }
        }
    `;
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({'query': query})
        }
    );
    const grades = (await response.json()).data.grades as GradeDistributionCollection;
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