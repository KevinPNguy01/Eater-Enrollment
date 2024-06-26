import { useState } from 'react'
import { Course } from '../../../constants/types'
import { CourseResult } from './CourseResult'
import { populateReviews } from '../../../helpers/RateMyProfessors';

/**
 * Component for displaying a list of Course results in a table.
 */
export function ScheduleResults(props: {courses: Course[]}) {
    const [gotReviews, setGotReviews] = useState(false);

    // When the courses change, the reviews wont change because gotReviews is now true
    if (!gotReviews && props.courses.length) {
        (async () => {
            await populateReviews(props.courses);
            setGotReviews(true);
        })()
    }

    return (
        <table className="h-0 table-fixed text-center overflow-x-scroll min-w-full border-spacing-0 border-separate rounded">
            {props.courses.map(course => <CourseResult key={course.id} course={course}/>)}
        </table>
    )
}