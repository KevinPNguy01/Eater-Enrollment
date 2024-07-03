import { Course } from "../../../constants/Types";

export function CourseInfo(props: {course: Course}) {
    const {course} = props;
    return (
        <div className="text-left left-0 p-2 w-1/2 top-full absolute bg-tertiary z-10 text-base font-normal border border-quaternary rounded">
            <p>
                <strong>Course Description:</strong>
                <br/>
                {course.description}
            </p>
            <br/>
            <p>
                <strong>Prerequisites:</strong>
                <br/>
                {course.prerequisite_text || "None"}
            </p>
            <br/>
            <p>
                <strong>Prerequisite For:</strong>
                <br/>
                {course.prerequisite_for?.map(({department, number}) => `${department} ${number}`).join(", ") || "None"}
            </p>
            <br/>
            <p>
                <strong>General Education Categories:</strong>
                <br/>
                <p className="whitespace-pre">{course.ge_list.join("\n")}</p>
            </p>
        </div>
    )
}