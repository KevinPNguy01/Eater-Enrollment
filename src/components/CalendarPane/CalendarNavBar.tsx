import { useContext } from "react"
import { ScheduleContext } from "../Main/App"
import { ScheduleSelect } from "./ScheduleSelect";
import { addOfferingsToCalendar } from "../../helpers/FullCalendar";

export function CalendarNavBar(props: {showingFinals: boolean, setShowingFinals: (_: boolean) => void}) {
    const { calendarReference, addedCourses, scheduleIndex, saveSchedule, colorRules, removeOffering } = useContext(ScheduleContext);
    const {showingFinals, setShowingFinals} = props
    
    return(
        <nav className="bg-tertiary grid grid-cols-4 my-1">
            <ScheduleSelect/>
            <button className={`${showingFinals ? "bg-primary" : "bg-secondary"} m-2 border border-quaternary rounded`} onClick={() => {
                const offerings = addedCourses[scheduleIndex].courses.map(({offerings}) => offerings).flat();
                const calendar = calendarReference.current.getApi()
                calendar.removeAllEvents();
                setShowingFinals(!showingFinals);
                addOfferingsToCalendar(offerings, calendar, colorRules, !showingFinals);
            }}>
                Finals
            </button>
            <button 
                className="bg-secondary m-2 border border-quaternary rounded" 
                onClick={() => addedCourses[scheduleIndex].courses.map(({offerings}) => offerings).flat().forEach(offering => removeOffering(offering))}
            >
                🗑️
            </button>
            <button className="bg-secondary m-2 border border-quaternary rounded" onClick={() => saveSchedule()}>
                💾
            </button>
        </nav>
    )
}