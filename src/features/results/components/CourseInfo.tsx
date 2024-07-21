import { useContext } from "react";
import { SearchContext } from "../../../app/pages/CoursesPane";
import { Course } from "../../../constants/Types";

export function CourseInfo(props: {course: Course}) {
    const {course} = props;
    return (
        <div className="shadow-lg shadow-neutral-800 flex flex-col gap-4 text-left left-0 p-2 w-full top-full -translate-y-3 absolute bg-tertiary z-10 text-base font-normal rounded-b-xl rounded-tr-xl">
            <p>
                <span className="font-semibold">Course Description:</span>
                <br/>
                {course.description}
                <br/>
            </p>
            {course.ge_list.length ? (
                <p>
                    <span className="font-semibold">General Education Categories:</span>
                    <br/>
                    <p className="whitespace-pre">{course.ge_list.join("\n")}</p>
                </p>    
            ) : null}
            {course.prerequisite_text ? (
                <PrerequisiteInfo course={course}/>
            ) : null }
            {course.prerequisite_for.length ? (
                <PrerequisiteFor course={course}/>
            ) : null}
        </div>
    )
}

function PrerequisiteInfo(props: {course: Course}) {
    const search = useContext(SearchContext);
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
            <span className="font-semibold">Prerequisites:</span>
            <br/>
            <div>
                {strings.map(string => {
                    if (courseIds.has(string)) {
                        const {department, number} = courseIds.get(string)!;
                        return <a className="text-sky-500 hover:cursor-pointer" onClick={() => search([{department, number}])}>
                            {`${department} ${number} `}
                        </a>
                    } else {
                        return <span>{string + ' '}</span>
                    }
                })}
            </div>
        </div>
    );
}

function PrerequisiteFor(props: {course: Course}) {
    const search = useContext(SearchContext);
    const {course} = props;

    const prerequisites = new Map<string, string[]>();
    course.prerequisite_for.map(({department, number}) => {
        if (!prerequisites.has(department)) {
            prerequisites.set(department, []);
        }
        prerequisites.get(department)!.push(number);
    });

    return (
        <div>
            <span className="font-semibold">Prerequisite For:</span>
            <br/>
            <div>
                {[...prerequisites].sort(([,a], [,b]) => b.length - a.length).map(([department, numbers]) => (
                    <fieldset className="border border-quaternary rounded px-4 py-2 my-2 w-full flex flex-wrap flex-1 gap-x-4">
                        <legend className="text-base">{department}</legend>
                        {numbers.map(number => (
                            <a className="text-nowrap text-sky-500 hover:cursor-pointer" onClick={() => search([{department, number}])}>
                                {`${department} ${number}`}
                                <br/>
                            </a>
                        ))}
                    </fieldset>
                ))}
            </div>
        </div>
    );
}