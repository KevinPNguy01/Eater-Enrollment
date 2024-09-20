import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ImageIcon from '@mui/icons-material/Image';
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
import * as htmlToImage from 'html-to-image';
import moment from 'moment';

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
	const { height, width } = screenSize;

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

	const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) || (width > height && 1.33 * width / 2 < height);
	const showWeekend = showingFinals || currentSchedule.customEvents.map(({ days }) => days & 65).some(val => val);
	const eventSize = isMobile ? (showWeekend ? "event-small event-smaller" : "event-small") : "";
	const [contentHeight, setContentHeight] = useState("100%" as "100%" | "auto");
	const [minTime, setMinTime] = useState("07:00");
	const [maxTime, setMaxTime] = useState("22:00");

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
				setContentHeight={setContentHeight}
				setMinTime={setMinTime}
				setMaxTime={setMaxTime}
			/>
			<div ref={ref} id="calendar" className={`bg-secondary relative flex flex-col flex-grow relative ${eventSize}`}>
				<FullCalendar
					plugins={[timeGridPlugin]}
					initialView="timeGridWeek"
					headerToolbar={false}
					weekends={showWeekend}
					allDaySlot={false}
					height={contentHeight}
					contentHeight={contentHeight}
					expandRows={true}
					slotMinTime={minTime}
					slotMaxTime={maxTime}
					firstDay={showingFinals ? 6 : 7}
					slotLabelFormat={{
						hour: "numeric",
						meridiem: isMobile ? "short" : true
					}}
					dayHeaderFormat={{
						weekday: 'short',
					}}
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
						meridiem: !isMobile,
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

function CalendarNavBar(props: { showingFinals: boolean, setShowingFinals: (_: boolean) => void, menuState: boolean, setMenuState: (_: boolean) => void, setContentHeight: (_: "100%" | "auto") => void, setMinTime: (_: string) => void, setMaxTime: (_: string) => void }) {
	const { showingFinals, setShowingFinals, menuState, setMenuState, setContentHeight, setMinTime, setMaxTime } = props
	const prevState = useSelector(selectPastSchedules);
	const nextState = useSelector(selectFutureSchedules);
	const currentScheduleIndex = useSelector(selectCurrentScheduleIndex);
	const currentSchedule = useSelector(selectCurrentSchedule);
	const dispatch = useDispatch();

	return (
		<nav className="w-full bg-tertiary flex flex-wrap my-1 items-center justify-between px-0.5">
			{/** Container for components that change schedule view. */}
			<div className="flex w-fit items-center gap-4 h-fit p-2">
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
			<div className="px-4 flex flex-nowrap">
				{/** Download schedule image button. */}
				<IconButton
					color="white"
					onClick={async () => {
						const calendar = document.getElementById("calendar")!;
						setContentHeight("auto");
						const events = (
							showingFinals ? createFinalEvents(currentSchedule.courses.map(({ offerings }) => offerings).flat()) :
								createEvents(currentSchedule.courses.map(({ offerings }) => offerings).flat()).concat(createCustomEvents(currentSchedule.customEvents))
						);
						const times = events.map(event => {
							const start = moment(event.start);
							const end = moment(event.end);
							const startTime = 60 * start.hours() + start.minutes();
							const endTime = 60 * end.hours() + end.minutes();
							return [startTime, endTime];
						}).flat();
						const start = moment("00:00", "HH:mm");
						const end = moment("00:00", "HH:mm");
						const minTime = Math.min(...times);
						const maxTime = Math.max(...times);
						const roundedMin = Math.floor((minTime - 1) / 60) * 60;
						const roundedMax = Math.ceil((maxTime + 1) / 60) * 60;
						start.set("minutes", roundedMin);
						end.set("minutes", roundedMax);
						if (minTime - roundedMin > 30) calendar.classList.add("clip-timegrid-start");
						if (roundedMax - maxTime > 30) calendar.classList.add("clip-timegrid-end");
						setMinTime(start.format("HH:mm"));
						setMaxTime(end.format("HH:mm"));
						await new Promise(r => setTimeout(r, 0));
						htmlToImage.toPng(calendar as HTMLElement)
							.then(async function (dataUrl) {
								setContentHeight("100%");
								setMinTime("07:00");
								setMaxTime("22:00");
								calendar.classList.remove("clip-timegrid-start");
								calendar.classList.remove("clip-timegrid-end");

								if ((/iPhone|iPad|iPod/i.test(navigator.userAgent))) {
									// Use webshare to download on iOS devices.
									const blob = await fetch(dataUrl).then(r => r.blob());
									const file = new File([blob], 'schedule.png', { type: blob.type });
									navigator.share({ files: [file] });
								} else {
									// Use anchor tag to download on all other devices.
									const link = document.createElement('a');
									link.href = dataUrl;
									link.download = 'schedule.png';
									const event = new MouseEvent('click');
									link.dispatchEvent(event);
								}
							});
					}}
				>
					<ImageIcon />
				</IconButton>
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