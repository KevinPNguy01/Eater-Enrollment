import coursesJson from "../../../assets/allCourses.json";
import { Course } from "../../../constants/types";
import { ScheduleOptions } from "../../../helpers/PeterPortal";

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

searchSuggestions = searchSuggestions.concat(departmentSuggestions).concat(courseSuggestions);

export function autoSuggest(searchStr: string, setCourseSuggestions: (_: SearchSuggestion[]) => void) {
    const regExp = buildRegExp(searchStr);
    setCourseSuggestions([]);
    if (searchStr.length > 2) setCourseSuggestions(searchSuggestions.filter(
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