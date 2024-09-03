import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { useContext } from "react";
import { Course } from "types/Course";
import { SearchContext } from "../../../app/pages/CoursesPane";

const downArrowIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
    <path fill="#bbb" stroke="#bbb" strokeWidth="0.5" transform="translate(0,-1.5)" d="M8 9.8l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293L8 9.8z" />
</svg>


export function CourseInfo(props: { course: Course }) {
    const { course } = props;
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={downArrowIcon}
                aria-controls="panel1-content"
                id="panel1-header"
            >
                <span className="text-base font-semibold">{`${course.department} ${course.number}: ${course.title}`}</span>
            </AccordionSummary>
            <AccordionDetails className="text-left text-base">
                <div className="flex flex-col gap-4">
                    {course.description ? <CourseDescription course={course} /> : null}
                    {course.ge_list.length ? <GeInfo course={course} /> : null}
                    {course.prerequisite_text ? <PrerequisiteInfo course={course} /> : null}
                    {course.prerequisite_for.length ? <PrerequisiteFor course={course} /> : null}
                </div>
            </AccordionDetails>
        </Accordion>
    );
}

function CourseDescription(props: { course: Course }) {
    const { course } = props;
    return (
        <p>
            <span className="font-semibold">Course Description:</span>
            <br />
            {course.description}
            <br />
        </p>
    );
}

function GeInfo(props: { course: Course }) {
    const { course } = props;
    return (
        <div>
            <span className="font-semibold">General Education Categories:</span>
            <br />
            <p className="whitespace-pre">{course.ge_list.join("\n")}</p>
        </div>
    );
}

function PrerequisiteInfo(props: { course: Course }) {
    const search = useContext(SearchContext);
    const { course } = props;

    // Combine course department and numbers into ids.
    let text = course.prerequisite_text.slice();
    course.prerequisite_list.forEach(course => {
        const { department, number } = course;
        const id = (department + number).replace(' ', '');
        text = text.replaceAll(`${department} ${number}`, ` ${id} `);
    });
    text = text.replaceAll("  ", ' ');

    // Map course ids to corresponding course.
    const courseIds = new Map(course.prerequisite_list.map(course => [(course.department + course.number).replace(' ', ''), course]));

    // Combine strings that don't represent courses.
    const strings = text.split(" ");
    for (let i = 0; i < strings.length - 1; ++i) {
        if (!courseIds.has(strings[i]) && !courseIds.has(strings[i + 1])) {
            strings[i] += ' ' + strings[i + 1];
            strings.splice(i + 1, 1);
            --i;
        }
    }

    return (
        <div>
            <span className="font-semibold">Prerequisites:</span>
            <br />
            <div>
                {strings.map((string, index) => {
                    if (courseIds.has(string)) {
                        const { department, number } = courseIds.get(string)!;
                        return <a key={index} className="text-sky-500 hover:cursor-pointer" onClick={() => search([{ department, number }])}>
                            {`${department} ${number} `}
                        </a>
                    } else {
                        return <span key={index}>{string + " "}</span>
                    }
                })}
            </div>
        </div>
    );
}

function PrerequisiteFor(props: { course: Course }) {
    const search = useContext(SearchContext);
    const { course } = props;

    const prerequisites = new Map<string, string[]>();
    course.prerequisite_for.map(({ department, number }) => {
        if (!prerequisites.has(department)) {
            prerequisites.set(department, []);
        }
        prerequisites.get(department)!.push(number);
    });

    return (
        <div>
            <span className="font-semibold">Prerequisite For:</span>
            <br />
            <div>
                {[...prerequisites].sort(([, a], [, b]) => b.length - a.length).map(([department, numbers]) => (
                    <fieldset key={department} className="border border-quaternary rounded px-4 py-2 my-2 w-full flex flex-wrap flex-1 gap-x-4">
                        <legend className="text-base">{department}</legend>
                        {numbers.map(number => (
                            <a key={number} className="text-nowrap text-sky-500 hover:cursor-pointer" onClick={() => search([{ department, number }])}>
                                {`${department} ${number}`}
                                <br />
                            </a>
                        ))}
                    </fieldset>
                ))}
            </div>
        </div>
    );
}