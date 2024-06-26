import { useContext } from 'react'
import { ScheduleContext } from '../Main/App';
import { ScheduleResults } from '../SearchTab/Results/ScheduleResult';

export function AddedTab(props: {activeTab: string}) {
    const { currentSchedule, addedCourses } = useContext(ScheduleContext);
    return (
        <div className={`h-1 flex flex-col flex-grow ${props.activeTab === "added" ? "block" : "hidden"}`}>
            <div className="h-1 overflow-y-scroll flex-grow">
                {
                    addedCourses.get(currentSchedule) ? <ScheduleResults courses={addedCourses.get(currentSchedule)!}/> : ""
                }
            </div>
        </div>
    )
}