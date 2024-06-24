import { useContext } from 'react'
import { CourseResult } from '../SearchTab/Results/CourseResult';
import { ScheduleContext } from '../Main/App';

export function AddedTab(props: {activeTab: string}) {
    const { currentSchedule, addedCourses } = useContext(ScheduleContext);
    return (
        <div className={`h-1 flex flex-col flex-grow ${props.activeTab === "added" ? "block" : "hidden"}`}>
            <div className="h-1 overflow-y-scroll flex-grow">
                {addedCourses.get(currentSchedule)?.map((course) => (
                    <CourseResult key={`${course.department} ${course.number}`} course={course}/>
                ))}
            </div>
        </div>
    )
}