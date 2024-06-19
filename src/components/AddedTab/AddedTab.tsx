import React, { useContext } from 'react'
import { AddedCoursesContext } from '../Main/App'
import { CourseResult } from '../SearchTab/Results/CourseResult';

export function AddedTab(props: {activeTab: string}) {
    const addedCourses = useContext(AddedCoursesContext);
    return (
        <div className={`h-1 flex flex-col flex-grow ${props.activeTab === "added" ? "block" : "hidden"}`}>
            <div className="h-1 overflow-y-scroll flex-grow">
                {addedCourses.map((course) => (
                    <CourseResult key={`${course.department} ${course.number}`} course={course}/>
                ))}
            </div>
        </div>
    )
}