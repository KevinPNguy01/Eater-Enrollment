import { useContext } from "react";
import { SearchContext } from "../../../app/pages/CoursesPane";
import { Course } from "../../../constants/Types";

export function CourseInfo(props: {course: Course}) {
    const {course} = props;
    return (
        <div className="text-left left-0 p-2 w-1/2 top-full absolute bg-tertiary z-10 text-base font-normal border border-quaternary rounded">
            <p>
                <strong>Course Description:</strong>
                <br/>
                {course.description}
                <br/><br/>
            </p>
            {course.prerequisite_text ? (
                <PrerequisiteInfo course={course}/>
            ) : null }
            {course.prerequisite_for.length ? (
                <PrerequisiteFor course={course}/>
            ) : null}
            {course.ge_list.length ? (
                <p>
                    <strong>General Education Categories:</strong>
                    <br/>
                    <p className="whitespace-pre">{course.ge_list.join("\n")}</p>
                    <br/>
                </p>    
            ) : null}
        </div>
    )
}

function PrerequisiteInfo(props: {course: Course}) {
    const searchCourse = useContext(SearchContext);
    const {course} = props;

    // Combine course department and numbers into ids.
    let text = course.prerequisite_text.slice();
    course.prerequisite_list.forEach(course => {
        course.id = `${course.department}${course.number}`.replaceAll(' ', '');
        const {department, number, id} = course;
        text = text.replaceAll(`${department} ${number}`, ` ${id} `);
    });
    text = text.replaceAll("  ", ' ');

    // Map course ids to corresponding course.
    const courseIds = new Map(course.prerequisite_list.map(course => [course.id, course]));

    // Combine strings that don't represent courses.
    const strings = text.split(" ");
    for (let i = 0; i < strings.length - 1; ++i) {
        if (!courseIds.has(strings[i]) && !courseIds.has(strings[i+1])) {
            strings[i] += ' ' + strings[i+1];
            strings.splice(i+1, 1);
            --i;
        }
    }

    return (
        <div>
            <strong>Prerequisites:</strong>
            <br/>
            <div>
                {strings.map(string => {
                    if (courseIds.has(string)) {
                        const {department, number} = courseIds.get(string)!;
                        return <a className="text-sky-500 hover:cursor-pointer" onClick={() => searchCourse({department, number})}>
                            {`${department} ${number} `}
                        </a>
                    } else {
                        return <span>{string + ' '}</span>
                    }
                })}
            </div>
            <br/><br/>
        </div>
    );
}

function PrerequisiteFor(props: {course: Course}) {
    const searchCourse = useContext(SearchContext);
    const {course} = props;

    return (
        <div>
            <strong>Prerequisite For:</strong>
            <br/>
            <div>
                {course.prerequisite_for.map(({department, number}, index) => {
                    return <a className="text-sky-500 hover:cursor-pointer" onClick={() => searchCourse({department, number})}>
                        {`${index ? ", " : ""}${department} ${number}`}
                    </a>
                })}
            </div>
            <br/><br/>
        </div>
    );
}