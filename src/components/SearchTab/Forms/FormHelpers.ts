import { Course } from "../../../constants/types";
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
    return response.json();
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
    return response.json();
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
    return response.json();
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