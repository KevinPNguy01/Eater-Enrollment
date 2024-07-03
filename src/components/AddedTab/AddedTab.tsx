import { useContext } from 'react'
import { ScheduleContext } from '../Main/App';
import { ScheduleResults } from '../SearchTab/Results/ScheduleResult';
import { FilteringOptions, SortingOptions } from '../SearchTab/Results/SearchResults';

export function AddedTab(props: {activeTab: string}) {
    const { scheduleIndex, addedCourses } = useContext(ScheduleContext);
    return (
        <div className={`h-1 flex flex-col flex-grow ${props.activeTab === "added" ? "block" : "hidden"}`}>
            <div className="h-1 overflow-y-scroll flex-grow">
                <ScheduleResults 
                    sortingOptions={{sortBy:"Name", direction:"Ascending"} as SortingOptions} 
                    filteringOptions={{
                        sectionTypes: new Set(["Lec", "Dis", "Lab", "Sem", "Stu", "Tut", "Act", "Res", "Fld", "Col", "Qiz", "Tap"]),
                        statusTypes: new Set(["OPEN", "NewOnly", "Waitl", "FULL"])
                    } as FilteringOptions} 
                    courses={addedCourses[scheduleIndex].courses}
                    />
            </div>
        </div>
    )
}