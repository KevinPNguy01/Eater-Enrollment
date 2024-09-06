import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { CustomEventMenu } from 'features/calendar/components/CustomEventMenu';
import { EventInfo } from 'features/calendar/components/EventInfo';
import { ScheduleSelect } from 'features/calendar/components/ScheduleSelect';
import { EventClickArg } from 'fullcalendar/index.js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentSchedule, selectCurrentScheduleIndex, selectFutureSchedules, selectPastSchedules } from 'stores/selectors/ScheduleSet';
import { clearSchedule } from 'stores/slices/ScheduleSet';
import { createCustomEvents, createEvents, createFinalEvents } from 'utils/FullCalendar';
import useWindowDimensions from 'utils/WindowDimensions';
import { newCustomEvent } from '../../helpers/CustomEvent';

export function CalendarPane() {
	const currentSchedule = useSelector(selectCurrentSchedule);
	const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
	const [eventClickArg, setEventClickArg] = useState(null as EventClickArg | null);
	const [showingFinals, setShowingFinals] = useState(false);
	const [scrollPos, setScrollPos] = useState(0);
	const [calendarRect, setCalendarRect] = useState(null as unknown as DOMRect);
	const [menuState, setMenuState] = useState(false);
	const [customEvent, setCustomEvent] = useState(newCustomEvent());
	const ref = useRef(null as unknown as HTMLDivElement);
	const screenSize = useWindowDimensions();

	// Update calendar rect when screen size changes.
	useEffect(() => {
		setCalendarRect(ref.current.getBoundingClientRect())
	}, [ref, screenSize]);

	// Close EventInfo card when switching schedules or toggle finals.
	useEffect(() => {
		setEventClickArg(null);
	}, [currentScheduleIndex, showingFinals]);

	// Add event listener for when the FullCalendar is scrolled.
	useEffect(() => {
		document.getElementsByClassName("fc-scroller-liquid-absolute").item(0)?.addEventListener(
			"scroll",
			e => setScrollPos((e.target as HTMLDivElement).scrollTop));
	}, []);

	return (
		<div
			className={`flex flex-col flex-grow`}
			onClick={() => {
				// Clicking anywhere on the CalendarPane will close any EventInfo cards and the CustomEvent menu.
				setEventClickArg(null);
				setMenuState(false);
			}}
		>
			<CalendarNavBar
				showingFinals={showingFinals}
				setShowingFinals={setShowingFinals}
				menuState={menuState}
				setMenuState={bool => {
					setCustomEvent(newCustomEvent());
					setMenuState(bool)
				}}
			/>
			<div ref={ref} id="calendar" className="relative flex flex-col flex-grow relative">
				<FullCalendar
					plugins={[timeGridPlugin]}
					initialView="timeGridWeek"
					headerToolbar={false}
					weekends={showingFinals || currentSchedule.customEvents.map(({ days }) => days & 65).some(val => val)}
					allDaySlot={false}
					height="100%"
					expandRows={true}
					slotMinTime="07:00:00"
					slotMaxTime="23:00:00"
					firstDay={showingFinals ? 6 : 7}
					slotLabelFormat={{ hour: "numeric" }}
					dayHeaderFormat={{ weekday: 'short' }}
					eventBorderColor="#00000080"
					eventClick={(info) => {
						info.jsEvent.stopPropagation();
						setEventClickArg(eventClickArg && info.event.id === eventClickArg.event.id ? null : info);
					}}
					events={(
						showingFinals ? createFinalEvents(currentSchedule.courses.map(({ offerings }) => offerings).flat()) :
							createEvents(currentSchedule.courses.map(({ offerings }) => offerings).flat()).concat(createCustomEvents(currentSchedule.customEvents))
					)}
					eventTimeFormat={{
						hour: "numeric",
						minute: "2-digit",
						meridiem: true
					}}
				/>
				{/** Info card for clicked events. */}
				{eventClickArg && (
					<EventInfo
						eventClickArg={eventClickArg}
						calendarRect={calendarRect}
						scrollPos={scrollPos}
						close={() => setEventClickArg(null)}
						updateEvent={() => {
							setCustomEvent(eventClickArg.event.extendedProps.source);
							setMenuState(true)
						}}
					/>
				)}
				{/** Menu for creating/updating custom events. */}
				<Backdrop className="!absolute z-20" open={menuState} onClick={() => setMenuState(false)}>
					{menuState && <CustomEventMenu event={customEvent} closeMenu={() => setMenuState(false)} />}
				</Backdrop>
			</div>
		</div>
	)

}

function CalendarNavBar(props: { showingFinals: boolean, setShowingFinals: (_: boolean) => void, menuState: boolean, setMenuState: (_: boolean) => void }) {
	const { showingFinals, setShowingFinals, menuState, setMenuState } = props
	const prevState = useSelector(selectPastSchedules);
	const nextState = useSelector(selectFutureSchedules);
	const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
	const dispatch = useDispatch();

	return (
		<nav className="w-full bg-tertiary flex my-1 items-center justify-between px-0.5">
			{/** Container for components that change schedule view. */}
			<div className="flex w-1/2 items-center gap-4 h-fit">
				<ScheduleSelect />
				{/** Toggle finals button. */}
				<Button
					className="w-fit h-fit !px-4 !py-0.5"
					sx={showingFinals ? { "&:hover": { backgroundColor: "#008000", border: "#bbb 1px solid" } } : null}
					variant={showingFinals ? "contained" : "outlined"}
					color={showingFinals ? "primary" : "white"}
					onClick={() => setShowingFinals(!showingFinals)}
				>
					Finals
				</Button>
			</div>
			{/** Container for buttons that mutate schedules. */}
			<div className="px-4">
				{/** Undo button. */}
				<IconButton
					color="white"
					disabled={!prevState}
					onClick={() => dispatch({ type: "schedules/undo" })}
				>
					<UndoIcon />
				</IconButton>
				{/** Redo button. */}
				<IconButton
					color="white"
					disabled={!nextState}
					onClick={() => dispatch({ type: "schedules/redo" })}
				>
					<RedoIcon />
				</IconButton>
				{/** Clear schedule button. */}
				<IconButton
					color="white"
					onClick={() => dispatch(clearSchedule(currentScheduleIndex))}
				>
					<DeleteIcon />
				</IconButton>
				{/** Open custom event menu button. */}
				<IconButton
					color="white"
					onClick={e => {
						e.stopPropagation();
						setMenuState(!menuState);
					}}
				>
					<AddIcon />
				</IconButton>
			</div>
		</nav>
	)
}