import React, { useState } from 'react'
import { Course } from '../../../constants/types'
import { CourseResult } from './CourseResult'
import { populateReviews } from '../../../helpers/RateMyProfessors';

function ScheduleResults(props: {courses: Course[]}) {
    const [gotReviews, setGotReviews] = useState(false);

    const updateReviews = async () => {
        await populateReviews(props.courses);
        setGotReviews(true);
    }
    if (!gotReviews && props.courses.length) {
        updateReviews();
    }
    return (
        <table className="h-0 table-fixed text-center overflow-x-scroll min-w-full border-spacing-0 border-separate rounded">
            {props.courses.map(course => <CourseResult course={course}/>)}
        </table>
    )
}

export default ScheduleResults