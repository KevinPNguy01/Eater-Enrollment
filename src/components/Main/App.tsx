import { MutableRefObject, createContext, useEffect, useRef, useState } from 'react';
import { NavBar, Calendar, Courses } from '..';
import { Course, CourseOffering } from '../../constants/types';
import { getCourseByCode } from '../SearchTab/Forms/FormHelpers';
import { CalendarApi } from 'fullcalendar/index.js';
import FullCalendar from '@fullcalendar/react';

// Define the context type of schedule related functions and data.
type ScheduleContextType = {
	calendarReference: MutableRefObject<null>,
	currentSchedule: string,
	addedCourses: Map<string, Course[]>,
	addOffering: (offering: CourseOffering) => void, 
	removeOffering: (offering: CourseOffering) => void,
	containsOffering: (offering: CourseOffering) => boolean,
	createSchedule: (scheduleName: string) => void,
	loadSchedule: (scheduleName: string) => void,
	saveSchedule: () => void
}

// Context provider for accessing schedule functions and data.
export const ScheduleContext = createContext(
	{} as ScheduleContextType
);

// Navigation bar with calendar on the left, and everything else on the right.
function App() {
	const calendarRef = useRef(null);
	const [addedCourses, setAddedCourses] = useState(new Map<string, Course[]>())
	const updateMap = () => setAddedCourses(new Map(addedCourses));
	const [currentSchedule, setCurrentSchedule] = useState("Schedule 1");
	const loadSchedule = (scheduleName: string) => {
		const calendar = (calendarRef.current! as InstanceType<typeof FullCalendar>)?.getApi() as CalendarApi;
		setCurrentSchedule(scheduleName);
		calendar.removeAllEvents();

		const offerings = addedCourses.get(scheduleName)!.map((course) => course.offerings).flat();
		offerings.forEach((offering) => {
			if (offering.meetings[0].time !== "TBA") {
				const course = offering.course;

				// Get the days of the week for this course offering.
				const days = offering.meetings[0].days;
				const dayOffsets = [];
				if (days.includes("M")) dayOffsets.push(0);
				if (days.includes("Tu")) dayOffsets.push(1);
				if (days.includes("W")) dayOffsets.push(2);
				if (days.includes("Th")) dayOffsets.push(3);
				if (days.includes("F")) dayOffsets.push(4);
	
				// Get the start and end times for this course offering.
				const [startTime, endTime] = parseTime(offering.meetings[0].time);
				const monday = getMonday();
	
				// Calculate color and luminance for event.
				const hue = hashString(`${course.id}${offering.section.type}`) % 360;
				const saturation = 75;
				const lightness = 50;
				const rgb = hslToRgb(hue/360, saturation/100, lightness/100);
				const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2])/255;
	
				// Add an event to the calendar for each meeting day.
				for (const days of dayOffsets) {
					startTime.setDate(monday.getDate() + days);
					endTime.setDate(monday.getDate() + days);
					calendar?.addEvent({
						title: `${course.department} ${course.number} ${offering.section.type}`,
						start: startTime.toISOString(),
						end: endTime.toISOString(),
						id: `${offering.section.code}-${days}`,
						backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
						textColor: luminance > 0.5 ? "black" : "white"
					});
				} 
			}
		});
	}

	useEffect(() => {
		if (addedCourses.size || !localStorage.getItem("schedule")) {
			return;
		}

		localStorage.getItem("schedule")!.split("\n").forEach(
			(scheduleString) => {
				const [scheduleName] = scheduleString.split(":");
				addedCourses.set(scheduleName, []);
			}
		);

		const loadSchedules = () => {
			localStorage.getItem("schedule")!.split("\n").forEach(async (scheduleString) => {
				const quarterYearGroups = new Map<string, string[]>();
				const [scheduleName, offeringsString] = scheduleString.split(":");
				offeringsString.split(";").forEach((offeringString) => {
					const values = offeringString.split(",");
					const quarterYear = values[0] + " " + values[1];
					const code = values[2];
					if (!quarterYearGroups.has(quarterYear)) quarterYearGroups.set(quarterYear, []);
					quarterYearGroups.get(quarterYear)!.push(code)
				})

				for (const [quarterYear, codes] of quarterYearGroups) {
					const [quarter, year] = quarterYear.split(" ");
					// API only allows 10 codes at a time.
					for (let i = 0; i < codes.length; i += 10) {
						const offerings = await getCourseByCode(quarter, year, codes.slice(i, i+10).join(","));
						offerings.forEach((offering) => {if (!containsOffering(offering, scheduleName)) addOffering(offering, scheduleName)});
					}
				}

				loadSchedule(currentSchedule);
			});
		}
		loadSchedules();
		
	});

	const saveSchedule = () => {
		localStorage.setItem("schedule", 
			Array.from(addedCourses.entries()).map(
				([scheduleName, courses]) => (
					scheduleName + ":" + courses.map(
						(course) => course.offerings.map(
							(offering) => `${offering.quarter},${offering.year},${offering.section.code}`
						)
					).flat().join(";")
				)
			).join("\n")
		);
	}

	/**
     * Adds the given course offering to the calendar and data.
     * @param offering The course offering to add.
     */
	const addOffering = (offering: CourseOffering, scheduleName=currentSchedule) => {
		const calendar = (calendarRef.current! as InstanceType<typeof FullCalendar>)?.getApi() as CalendarApi;
		const course = offering.course;
		if (!addedCourses.get(scheduleName)) {
			addedCourses.set(scheduleName, [] as Course[]);
		}

		// If the course was never added before, create a new course with empty offerings.
		if (!addedCourses.get(scheduleName)!.map((course) => course.id).includes(offering.course.id)) {
			const newCourse = structuredClone(offering.course);
			newCourse.offerings = [];
			addedCourses.get(scheduleName)!.push(newCourse);
		}
		addedCourses.get(scheduleName)!.find((course) => course.id === offering.course.id)?.offerings.push(offering);

		// Check all the boxes.
		for (const checkbox of document.getElementsByClassName(`checkbox-${offering.course.id}-${offering.section.code}`)) {
			(checkbox as HTMLInputElement).checked = true;
		}

		if (offering.meetings[0].time !== "TBA") {
			// Get the days of the week for this course offering.
			const days = offering.meetings[0].days;
			const dayOffsets = [];
			if (days.includes("M")) dayOffsets.push(0);
			if (days.includes("Tu")) dayOffsets.push(1);
			if (days.includes("W")) dayOffsets.push(2);
			if (days.includes("Th")) dayOffsets.push(3);
			if (days.includes("F")) dayOffsets.push(4);

			// Get the start and end times for this course offering.
			const [startTime, endTime] = parseTime(offering.meetings[0].time);
			const monday = getMonday();

			// Calculate color and luminance for event.
			const hue = hashString(`${course.id}${offering.section.type}`) % 360;
			const saturation = 75;
			const lightness = 50;
			const rgb = hslToRgb(hue/360, saturation/100, lightness/100);
			const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2])/255;

			// Add an event to the calendar for each meeting day.
			for (const days of dayOffsets) {
				startTime.setDate(monday.getDate() + days);
				endTime.setDate(monday.getDate() + days);
				calendar?.addEvent({
					title: `${course.department} ${course.number} ${offering.section.type}`,
					start: startTime.toISOString(),
					end: endTime.toISOString(),
					id: `${offering.section.code}-${days}`,
					backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
					textColor: luminance > 0.5 ? "black" : "white"
				});
			} 
		}
		
		updateMap();
	}

	/**
	 * Removes the given course offering from the calendar and data.
	 * @param offering The course offering to remove.
	 */
	const removeOffering = (offering: CourseOffering) => {
		const calendar = (calendarRef.current! as InstanceType<typeof FullCalendar>)?.getApi() as CalendarApi;
		if (!addedCourses.get(currentSchedule)) {
			addedCourses.set(currentSchedule, [] as Course[]);
		}

		// Remove course offering from appropriate course.
		const addedCourse = addedCourses.get(currentSchedule)!.find((course) => course.id === offering.course.id);
		const offerings = addedCourse?.offerings;
		const index = offerings?.findIndex((other_offering) => other_offering.section.code === offering.section.code);
		if (offerings && index! > -1) {
			offerings.splice(index!, 1);
		}

		// If the course has no offerings now, remove it.
		if (offerings && offerings.length == 0) {
			addedCourses.get(currentSchedule)!.splice(addedCourses.get(currentSchedule)!.findIndex((course) => course.id == addedCourse.id), 1);
		}

		// Uncheck all the boxes.
		for (const checkbox of document.getElementsByClassName(`checkbox-${offering.course.id}-${offering.section.code}`)) {
			(checkbox as HTMLInputElement).checked = false;
		}

		// Remove events with matching section codes from the calendar.
		for (let i = 0; i < 5; ++i) {
			const event = calendar?.getEventById(`${offering.section.code}-${i}`);
			if (event) event.remove()
		}

		updateMap();
	}

	/**
	 * 
	 * @param offering The offering to check for.
	 * @returns Whether the offering is already in the current schedule.
	 */
	const containsOffering = (offering: CourseOffering, scheduleName=currentSchedule) => {
		if (!addedCourses.get(scheduleName)) {
			addedCourses.set(scheduleName, [] as Course[]);
		}

		return addedCourses.get(scheduleName)!.filter(
			(course) => course.id === offering.course.id
		).map(
			(course) => course.offerings.map(
				(offering) => offering.section.code
			)
		).flat().includes(offering.section.code);
	}

	const createSchedule = (scheduleName: string) => {
		addedCourses.set(scheduleName, []);
		loadSchedule(scheduleName);
	}

	return (
		<ScheduleContext.Provider value={
			{ 
				calendarReference: calendarRef, 
				currentSchedule: currentSchedule,
				addedCourses: addedCourses,
				addOffering: addOffering, 
				removeOffering: removeOffering,
				createSchedule: createSchedule,
				loadSchedule: loadSchedule,
				saveSchedule: saveSchedule,
				containsOffering: containsOffering
			}
		}>
			<div className="h-screen overflow-hidden flex text-white flex-col">
				<NavBar/>
				<div id="main" className={`h-1 grow bg-secondary grid grid-cols-2`}>
					<Calendar/>
					<Courses/>
				</div>
			</div>
		</ScheduleContext.Provider>
	)
}

/**
 * Generates a simple hash code for the given input string.
 * @param str The string to hash.
 * @returns The hash code of the string.
 */
function hashString(str: string) {
    return str.split('').reduce((hash, char) => (((hash << 5) - hash) + char.charCodeAt(0)), 0);
}

/**
 * 
 * @returns A Date object representing the monday of the current week.
 */
function getMonday() {
    const d = new Date();
    const day = d.getDay()
    const diff = d.getDate() - day + 1; // Adjust when day is sunday.
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    return new Date(d.setDate(diff));
}

/**
 * 
 * @param time The times to parse as a string.
 * @returns Two Date objects storing the start/end times represented by the given time string.
 */
function parseTime(time: string) {
    time = time.replace(/\s+/g, "");                        // Remove whitespace.
    const pm = time[time.length-1] === "p" ? true : false;  // The time ends past 12 if the string ends in 'p'.
    const timeArray = time.replace("p", "").split("-");     // Drop the p and split by '-' into two separate times.

    // Isolate the start/end hours and minutes.
    const startArray = timeArray[0].split(":");             
    const endArray = timeArray[1].split(":");
    let startHour = parseInt(startArray[0]);
    const startMinutes = parseInt(startArray[1]);
    let endHour = parseInt(endArray[0]);
    const endMinutes = parseInt(endArray[1]);

    // If the end time is in the pm, add 12 to the hours.
    if (pm) {
        startHour += 12;
        endHour += 12;
    }

    // Adjust for if the end time is actually at 12.
    if (endHour >= 24) {
        endHour = 12;
    }

    // Make sure start hour <= end hour.
    if (startHour > endHour) {
        startHour -= 12;
    }

    // Date object for the start time.
    const startTime = new Date();
    startTime.setHours(startHour);
    startTime.setMinutes(startMinutes);

    // Date object for the end time.
    const endTime = new Date(startTime);
    endTime.setHours(endHour);
    endTime.setMinutes(endMinutes);

    return [startTime, endTime]
}

const { round } = Math;
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h: number, s: number, l: number) {
    let r, g, b;
  
    if (s === 0) {
        r = g = b = l; // achromatic    
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1/3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1/3);
    }
    return [round(r * 255), round(g * 255), round(b * 255)];
}

function hueToRgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

export default App