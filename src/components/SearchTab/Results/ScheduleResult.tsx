import { Course } from '../../../constants/types'
import { CourseResult } from './CourseResult'

/**
 * Component for displaying a list of Course results in a table.
 */
export function ScheduleResults(props: {courses: Course[]}) {
    return (
        <table className="h-0 table-fixed text-center overflow-x-scroll min-w-full border-spacing-0 border-separate rounded">
            {props.courses.map(course => <CourseResult key={course.id} course={course}/>)}
        </table>
    )
}