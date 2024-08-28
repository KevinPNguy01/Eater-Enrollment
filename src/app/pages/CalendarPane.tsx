import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useContext, useEffect, useRef, useState } from 'react';
import { EventInfo } from '../../features/calendar/components/EventInfo';
import { ScheduleSelect } from '../../features/calendar/components/ScheduleSelect';
import { ScheduleContext } from '../App';
import { createCustomEvents, createEvents, createFinalEvents } from '../../utils/FullCalendar';
import { Backdrop, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { EventClickArg } from 'fullcalendar/index.js';
import useWindowDimensions from '../../utils/WindowDimensions';
import AddIcon from '@mui/icons-material/Add';
import { CustomEventMenu } from '../../features/calendar/components/CustomEventMenu';

export function CalendarPane(props: {showingFinals: boolean, setShowingFinals: (_: boolean) => void}) {
	const {showingFinals, setShowingFinals} = props;
	
	const { calendarReference, scheduleIndex, addedCourses, colorRules} = useContext(ScheduleContext);
	const [eventClickArg, setEventClickArg] = useState(null as EventClickArg | null);
	const ref = useRef(null as unknown as HTMLDivElement);
	const [scrollPos, setScrollPos] = useState(0);
	const [calendarRect, setCalendarRect] = useState(null as unknown as DOMRect);
	const screenSize = useWindowDimensions();
	const [menuState, setMenuState] = useState(false);

	useEffect(() => {
		setCalendarRect(ref.current.getBoundingClientRect())
	}, [ref, screenSize]);

	useEffect(() => {
		setEventClickArg(null);
	}, [scheduleIndex, showingFinals]);

	useEffect(() => {
		document.getElementsByClassName("fc-scroller-liquid-absolute").item(0)?.addEventListener(
			"scroll", 
			e => setScrollPos((e.target as HTMLDivElement).scrollTop));
	}, []);

	console.log((
		showingFinals ? createFinalEvents(addedCourses[scheduleIndex].courses.map(({offerings}) => offerings).flat(), colorRules) : 
		createEvents(addedCourses[scheduleIndex].courses.map(({offerings}) => offerings).flat(), colorRules).concat(createCustomEvents(addedCourses[scheduleIndex].customEvents, colorRules))
))

	return (
		<div 
			className={`flex flex-col flex-grow`} 
			onClick={() => {
				setEventClickArg(null);
				setMenuState(false);
			}}
		>
			<CalendarNavBar showingFinals={showingFinals} setShowingFinals={setShowingFinals} menuState={menuState} setMenuState={setMenuState}/>
			<div ref={ref} id="calendar" className="relative flex flex-col flex-grow relative">
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
						info.jsEvent.stopPropagation();
						setEventClickArg(eventClickArg && info.event.id === eventClickArg.event.id ? null : info);
					}}
					events={
						(
							showingFinals ? createFinalEvents(addedCourses[scheduleIndex].courses.map(({offerings}) => offerings).flat(), colorRules) : 
							createEvents(addedCourses[scheduleIndex].courses.map(({offerings}) => offerings).flat(), colorRules).concat(createCustomEvents(addedCourses[scheduleIndex].customEvents, colorRules))
					)
					}
					eventTimeFormat={{
						hour: "numeric",
						minute: "2-digit",
						meridiem: true
					}}
				/>
				{eventClickArg ? <EventInfo eventClickArg={eventClickArg} scrollPos={scrollPos} close={() => setEventClickArg(null)} calendarRect={calendarRect}/> : null}
				<Backdrop className="!absolute z-20" open={menuState} onClick={() => setMenuState(false)}>
					{menuState && <CustomEventMenu closeMenu={() => setMenuState(false)}/>}
				</Backdrop>
			</div>
		</div>
	)

}

function CalendarNavBar(props: {showingFinals: boolean, setShowingFinals: (_: boolean) => void, menuState: boolean, setMenuState: (_: boolean) => void}) {
    const { addedCourses, scheduleIndex, removeOffering } = useContext(ScheduleContext);
    const {showingFinals, setShowingFinals, menuState, setMenuState} = props
    
    return (
        <nav className="w-full bg-tertiary flex my-1 items-center justify-between px-0.5">
			<div className="flex w-1/2 items-center gap-4 h-fit">
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
					onClick={e => {
						e.stopPropagation();
						setMenuState(!menuState);
					}}
				>
					<AddIcon/>
				</IconButton>
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