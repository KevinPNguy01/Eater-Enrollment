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
                <p>
                    <strong>Prerequisites:</strong>
                    <br/>
                    {course.prerequisite_text}
                    <br/><br/>
                </p>
            ) : null }
            {course.prerequisite_for.length ? (
                <p>
                    <strong>Prerequisite For:</strong>
                    <br/>
                    {course.prerequisite_for.map(({department, number}) => `${department} ${number}`).join(", ")}
                    <br/><br/>
                </p>
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