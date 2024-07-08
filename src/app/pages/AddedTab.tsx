import { useContext } from "react";
import { SortingOptions, FilteringOptions } from "./SearchResults";
import { restrictionCodes } from "../../constants/RestrictionCodes";
import { typeColors, statusColors } from "../../constants/TextColors";
import { ScheduleContext } from "../App";
import { ScheduleResults } from "../../features/results/components/ScheduleResult";

export function AddedTab() {
    const { scheduleIndex, addedCourses } = useContext(ScheduleContext);
    return (
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
    )
}