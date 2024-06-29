import { MutableRefObject, createContext, useEffect, useRef, useState } from 'react';
import { NavBar, Calendar, Courses } from '..';
import { Course, CourseOffering } from '../../constants/types';
import { CalendarApi } from 'fullcalendar/index.js';
import FullCalendar from '@fullcalendar/react';
import { requestSchedule } from '../../helpers/PeterPortal';
import { addOfferingsToCalendar, removeOfferingsFromCalendar } from '../../helpers/FullCalendar';

// Define the context type of schedule related functions and data.
type ScheduleContextType = {
	calendarReference: MutableRefObject<null>,
	addedCourses: {name: string, courses: Course[]}[],
	scheduleIndex: number,
	addOffering: (offering: CourseOffering) => void, 
	removeOffering: (offering: CourseOffering) => void,
	containsOffering: (offering: CourseOffering) => boolean,
	createSchedule: (scheduleName: string) => void,
	loadSchedule: (scheduleIndex: number) => void,
	saveSchedule: () => void
}

// Context provider for accessing schedule functions and data.
export const ScheduleContext = createContext(
	{} as ScheduleContextType
);

// Navigation bar with calendar on the left, and everything else on the right.
function App() {
	const calendarRef = useRef(null);
	const [addedCourses, setAddedCourses] = useState([{name: "Schedule 1", courses: [] as Course[]}])
	const [scheduleIndex, setScheduleIndex] = useState(0);
	const updateMap = () => setAddedCourses(addedCourses.slice());
	const [updateCounter, setUpdateCounter] = useState(0);
	const loadSchedule = (scheduleIndex: number) => {
		const calendar = (calendarRef.current! as InstanceType<typeof FullCalendar>)?.getApi() as CalendarApi;
		setScheduleIndex(scheduleIndex);
		calendar.removeAllEvents();

		const offerings = addedCourses[scheduleIndex].courses.map((course) => course.offerings).flat();
		addOfferingsToCalendar(offerings, calendar);
	}

	useEffect(() => {
		if (updateCounter || !localStorage.getItem("schedule")) {
			return;
		}
		setUpdateCounter(a => a+1)
		addedCourses.length = 0;

		localStorage.getItem("schedule")!.split("\n").forEach(
			(scheduleString) => {
				const [scheduleName] = scheduleString.split(":");
				addedCourses.push({name: scheduleName, courses: []});
			}
		);

		const loadSchedules = () => {
			localStorage.getItem("schedule")!.split("\n").forEach(async (scheduleString, index) => {
				const quarterYearGroups = new Map<string, string[]>();
				const [, offeringsString] = scheduleString.split(":");
				if (offeringsString === "") return;
				offeringsString.split(";").forEach((offeringString) => {
					const values = offeringString.split(",");
					const quarterYear = values[0] + " " + values[1];
					const code = values[2];
					if (!quarterYearGroups.has(quarterYear)) quarterYearGroups.set(quarterYear, []);
					quarterYearGroups.get(quarterYear)!.push(code)
				})

				for (const [quarterYear, codes] of quarterYearGroups) {
					const [quarter, year] = quarterYear.split(" ");
					const courses = await requestSchedule({
						quarter: quarter, 
						year: year, 
						section_codes: codes.join(","),
						callBack: () => setUpdateCounter(a => a+1)
					});
					courses.forEach(({offerings}) => offerings.forEach((offering) => {if (!containsOffering(offering, index)) addOffering(offering, index)}));
				
				}
			});
		}
		loadSchedules();
	}, []);

	const saveSchedule = () => {
		localStorage.setItem("schedule", 
			addedCourses.map(
				({name, courses}) => (
					name + ":" + courses.map(
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
	const addOffering = (offering: CourseOffering, index=scheduleIndex) => {
		const calendar = (calendarRef.current! as InstanceType<typeof FullCalendar>)?.getApi() as CalendarApi;

		// If the course was never added before, create a new course with empty offerings.
		if (!addedCourses[index].courses.map((course) => course.id).includes(offering.course.id)) {
			const newCourse = structuredClone(offering.course);
			newCourse.offerings = [];
			addedCourses[index].courses!.push(newCourse);
		}
		addedCourses[index].courses.find((course) => course.id === offering.course.id)?.offerings.push(offering);

		// Check all the boxes.
		for (const checkbox of document.getElementsByClassName(`checkbox-${offering.course.id}-${offering.section.code}`)) {
			(checkbox as HTMLInputElement).checked = true;
		}

		if (index === scheduleIndex) addOfferingsToCalendar([offering], calendar);
		
		updateMap();
	}

	/**
	 * Removes the given course offering from the calendar and data.
	 * @param offering The course offering to remove.
	 */
	const removeOffering = (offering: CourseOffering) => {
		const calendar = (calendarRef.current! as InstanceType<typeof FullCalendar>)?.getApi() as CalendarApi;

		// Remove course offering from appropriate course.
		const addedCourse = addedCourses[scheduleIndex].courses.find((course) => course.id === offering.course.id);
		const offerings = addedCourse?.offerings;
		const index = offerings?.findIndex((other_offering) => other_offering.section.code === offering.section.code);
		if (offerings && index! > -1) {
			offerings.splice(index!, 1);
		}

		// If the course has no offerings now, remove it.
		if (offerings && offerings.length == 0) {
			addedCourses[scheduleIndex].courses.splice(addedCourses[scheduleIndex].courses.findIndex((course) => course.id == addedCourse.id), 1);
		}

		// Uncheck all the boxes.
		for (const checkbox of document.getElementsByClassName(`checkbox-${offering.course.id}-${offering.section.code}`)) {
			(checkbox as HTMLInputElement).checked = false;
		}

		removeOfferingsFromCalendar([offering], calendar);

		updateMap();
	}

	/**
	 * 
	 * @param offering The offering to check for.
	 * @returns Whether the offering is already in the current schedule.
	 */
	const containsOffering = (offering: CourseOffering, index=scheduleIndex) => {
		return addedCourses[index].courses.filter(
			(course) => course.id === offering.course.id
		).map(
			(course) => course.offerings.map(
				(offering) => offering.section.code
			)
		).flat().includes(offering.section.code);
	}

	const createSchedule = (scheduleName: string) => {
		addedCourses.push({name: scheduleName, courses: []})
		loadSchedule(scheduleIndex + 1);
	}

	return (
		<ScheduleContext.Provider value={
			{ 
				calendarReference: calendarRef, 
				addedCourses: addedCourses,
				scheduleIndex: scheduleIndex,
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

export default App