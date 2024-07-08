import coursesJson from "../assets/allCourses.json";
import { Course } from "../constants/Types";
import { ScheduleOptions } from "./PeterPortal";

export type SearchSuggestion = {
    text: string;
    value: ScheduleOptions;
}
let searchSuggestions = [] as SearchSuggestion[];

const courses = coursesJson as {data: {allCourses: Course[]}};
const departmentSuggestions = Array.from(
    new Map(courses.data.allCourses.map(
        (course) => [course.department, course.department_name]
    )).entries()
).map(
    ([department, department_name]) => {return {
        text: `${department}: ${department_name}`,
        value: {department: department} as ScheduleOptions
    } as SearchSuggestion}
);
const courseSuggestions = courses.data.allCourses.map(({department, number, title}) => {
    return {
        text: `${department} ${number}: ${title}`,
        value: {
            department: department,
            number: number
        } as ScheduleOptions
    } as SearchSuggestion
})
const geSuggestions = [
    ["GE Ia (1a): Lower Division Writing", "GE-1A"],
    ["GE Ib (1b): Upper Division Writing", "GE-1B"],
    ["GE II (2): Science and Technology", "GE-2"],
    ["GE III (3): Social and Behavioral Sciences", "GE-3"],
    ["GE IV (4): Arts and Humanities", "GE-4"],
    ["GE Va (5a): Quantitative Literacy", "GE-5A"],
    ["GE Vb (5b): Formal Reasoning", "GE-5B"],
    ["GE VI (6): Language other than English", "GE-6"],
    ["GE VII (7): Multicultural Studies", "GE-7"],
    ["GE VIII (8): International/Global Issues", "GE-8"]
].map(([text, ge]) => ({text: text, value: {ge: ge} as ScheduleOptions} as SearchSuggestion));

searchSuggestions = searchSuggestions.concat(geSuggestions).concat(departmentSuggestions).concat(courseSuggestions);

export function autoSuggest(searchStr: string, setCourseSuggestions: (_: SearchSuggestion[]) => void) {
    const regExp = buildRegExp(searchStr);
    setCourseSuggestions([]);
    if (searchStr.length >= 2) setCourseSuggestions(searchSuggestions.filter(
        ({text}) => (regExp.test(` ${text}`.toLowerCase())))
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