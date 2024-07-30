import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useContext, useState } from 'react';
import { EventInfo } from '../../features/calendar/components/EventInfo';
import { ScheduleSelect } from '../../features/calendar/components/ScheduleSelect';
import { ScheduleContext } from '../App';
import { createEvents, createFinalEvents } from '../../utils/FullCalendar';
import { Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { EventImpl } from '@fullcalendar/core/internal';

export function CalendarPane(props: {showingFinals: boolean, setShowingFinals: (_: boolean) => void}) {
	const {showingFinals, setShowingFinals} = props;
	
	const { calendarReference, scheduleIndex, addedCourses, colorRules} = useContext(ScheduleContext);
	const [event, setEvent] = useState(null as unknown as EventImpl);
	const [pos, setPos] = useState({x:0, y:0});
	return (
		<div id="calendar" className={`flex flex-col flex-grow`}>
			<CalendarNavBar showingFinals={showingFinals} setShowingFinals={setShowingFinals}/>
			<FullCalendar 
				ref={calendarReference}
				plugins={[ timeGridPlugin ]}
				initialView="timeGridWeek"
				headerToolbar={false}
				weekends={showingFinals}
				allDaySlot={false}
				height="100%"
				expandRows={true}
				slotMinTime="07:00:00"
				slotMaxTime="23:00:00"
				firstDay={6}
				slotLabelFormat={{
				hour: "numeric"
				}}
				dayHeaderFormat={{ weekday: 'short' }}
				eventBorderColor="#00000080"
				eventClick={(info) => {
					event && info.event.id === event.id ? setEvent(null as unknown as EventImpl) : setEvent(info.event);
					setPos({x: info.el.getBoundingClientRect().left + info.el.getBoundingClientRect().width + 5, y: info.el.getBoundingClientRect().top});
				}}
				events={(showingFinals ? createFinalEvents : createEvents)(addedCourses[scheduleIndex].courses.map(({offerings}) => offerings).flat(), colorRules)}
				eventTimeFormat={{
					hour: "numeric",
					minute: "2-digit",
					meridiem: true
				}}
			/>
			{event ? <EventInfo event={event} close={() => setEvent(null as unknown as EventImpl)} pos={pos}/> : null}
		</div>
	)

}

function CalendarNavBar(props: {showingFinals: boolean, setShowingFinals: (_: boolean) => void}) {
    const { addedCourses, scheduleIndex, removeOffering } = useContext(ScheduleContext);
    const {showingFinals, setShowingFinals} = props
    
    return (
        <nav className="w-full bg-tertiary flex my-1 items-center justify-between">
			<div className="flex w-1/2 items-center">
				<ScheduleSelect/>
				<Button 
					className="w-fit h-fit !px-4 !py-0.5" 
					sx={showingFinals ? {"&:hover": {backgroundColor: "#008000", border: "#bbb 1px solid"}} : null} 
					variant={showingFinals ? "contained" : "outlined"} 
					color={showingFinals ? "primary" : "white"} 
					onClick={() => {
						setShowingFinals(!showingFinals);
					}}
				>
					Finals
				</Button>
			</div>
            <div className="px-4">
				<IconButton 
					color="white"
					onClick={() => addedCourses[scheduleIndex].courses.map(({offerings}) => offerings).flat().forEach(offering => removeOffering(offering))}
				>
					<DeleteIcon/>
				</IconButton>
			</div>
        </nav>
    )
}