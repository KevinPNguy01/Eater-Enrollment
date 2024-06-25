import courses from "../../../assets/allCourses.json";
import { Course } from "../../../constants/types";

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