import { Course } from "../../../constants/types";
import courses from "../../../assets/allCourses.json";

export async function getCourse(year: string, term: string, department: string, number: string) {
    const query: string = buildQuery(year, term, department, number);
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({'query': query})
        }
    );
    return response.json();
}

function buildQuery(year: string, term: string, department: string, number: string) {
    const sectionSelection = `section{code type number}`;
    const instructorSelection = `instructors{shortened_name}`
    const meetingsSelection = `meetings{time days building}`
    const offeringsConstructor = `offerings(year:${year}, quarter:"${term}")`;
    const offeringsSelection = `{year quarter restrictions status ${meetingsSelection} ${instructorSelection} num_total_enrolled max_capacity ${sectionSelection}}`;
    const offeringsQuery = `${offeringsConstructor} ${offeringsSelection}`;
    const courseConstructor = `course(id:"${(department+number+"").replace(" ", "")}")`;
    const courseSelection = `{id department number title ${offeringsQuery}}`;
    const query: string = `query { ${courseConstructor} ${courseSelection} }`;
    return query;
}

export async function getCourseByCode(year: string, term: string, code: string) {
    const query: string = buildQueryByCode(year, term, code);
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({'query': query})
        }
    );
    return response.json();
}

function buildQueryByCode(year: string, term: string, code: string) {
    const sectionSelection = `section{code type number}`;
    const instructorSelection = `instructors{shortened_name}`
    const meetingsSelection = `meetings{time days building}`
    const courseSelection = `course{id department number title}`;
    const offeringSelection = `{year quarter restrictions status ${meetingsSelection} ${instructorSelection} num_total_enrolled max_capacity ${sectionSelection} ${courseSelection} }`;
    const scheduleConstructor = `schedule(year:${year} quarter:"${term}" section_codes:"${code}")`;
    const query: string = `query { ${scheduleConstructor} ${offeringSelection} }`;
    console.log(query);
    return query;
}

export function autoSuggest(searchStr: string, setCourseSuggestions: (list: {department: string, number: string, title: string}[]) => void) {
    const regExp = buildRegExp(searchStr);
    setCourseSuggestions(new Array<Course>());
    if (searchStr.length > 2) setCourseSuggestions(courses.data.allCourses.filter(
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