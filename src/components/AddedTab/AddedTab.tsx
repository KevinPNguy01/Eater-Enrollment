import { useContext } from 'react'
import { ScheduleContext } from '../Main/App';
import { ScheduleResults } from '../SearchTab/Results/ScheduleResult';
import { FilteringOptions, SortingOptions } from '../SearchTab/Results/SearchResults';
import { restrictionCodes } from '../../constants/RestrictionCodes';
import { statusColors, typeColors } from '../../constants/TextColors';

export function AddedTab(props: {activeTab: string}) {
    const { scheduleIndex, addedCourses } = useContext(ScheduleContext);
    return (
        <div className={`h-1 flex flex-col flex-grow ${props.activeTab === "added" ? "block" : "hidden"}`}>
            <div className="h-1 overflow-y-scroll flex-grow">
                <ScheduleResults 
                    sortingOptions={{sortBy:"Name", direction:"Ascending", sortWithin:false} as SortingOptions} 
                    filteringOptions={{
                        sectionTypes: new Set(typeColors.keys()),
                        statusTypes: new Set(statusColors.keys()),
                        dayTypes: new Set(["M", "Tu", "W", "Th", "F"]),
                        restrictionTypes: new Set(restrictionCodes.keys())
                    } as FilteringOptions} 
                    courses={addedCourses[scheduleIndex].courses}
                    />
            </div>
        </div>
    )
}