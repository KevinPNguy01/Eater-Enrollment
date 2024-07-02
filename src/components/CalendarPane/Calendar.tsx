import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useContext, useState } from 'react';
import { ScheduleContext } from '../Main/App';
import { CourseOffering } from '../../constants/types';
import { CalendarNavBar } from './CalendarNavBar';
import { EventInfo } from './EventInfo';

export function Calendar(props: {showingFinals: boolean, setShowingFinals: (_: boolean) => void}) {
	const [offering, setOffering] = useState(null as unknown as CourseOffering);
	const [pos, setPos] = useState({x: 0, y: 0});
	const {showingFinals, setShowingFinals} = props;
	
	const { calendarReference, scheduleIndex, addedCourses} = useContext(ScheduleContext);
	return (
		<div id="calendar" className={`flex flex-col`}>
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
					setPos(({x: info.el.getBoundingClientRect().left + info.el.getBoundingClientRect().width + 5, y: info.el.getBoundingClientRect().top}));
					const clickedOffering = addedCourses[scheduleIndex].courses.map((course) => course.offerings).flat().find((offering) => offering.section.code === info.event.id.split("-")[0])!
					if (clickedOffering == offering) {
						setOffering(null as unknown as CourseOffering);
					} else {
						setOffering(clickedOffering);
					}
				}}
			/>
			{offering ? <EventInfo offering={offering} setOffering={setOffering} pos={pos}/> : null}
		</div>
	)

}