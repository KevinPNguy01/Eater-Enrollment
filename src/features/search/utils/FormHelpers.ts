import coursesJson from "../../../assets/allCourses.json";
import { Course } from "../../../types/Course";
import { Query } from "../../../utils/PeterPortal";

export type SearchSuggestion = {
    text: string;
    value: Query;
}

type CoursesJson = {data: {allCourses: Course[]}};
const courses = (coursesJson as CoursesJson).data.allCourses as Course[];

const departmentSuggestions = [
    ...new Map(courses.map(
        course => [course.department, course.department_name]
    ))
].map(
    ([department, department_name]) => ({
        text: `${department}: ${department_name}`,
        value: {department: department} as Query
    } as SearchSuggestion)
);
const courseSuggestions = courses.map(
    ({department, number, title}) => ({
        text: `${department} ${number}: ${title}`,
        value: {department, number} as Query
    } as SearchSuggestion)
);
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
].map(([text, ge]) => ({text, value: {ge} as Query} as SearchSuggestion));

const searchSuggestions = [...geSuggestions, ...departmentSuggestions, ...courseSuggestions];

export function getSuggestions(searchStr: string) {
    if (searchStr.length < 2) return [];
    const regExp = buildRegExp(searchStr);
    return searchSuggestions.filter(
        ({text}) => (regExp.test(` ${text.toLowerCase()}`)))
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