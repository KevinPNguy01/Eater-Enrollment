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
		addOfferingsToCalendar(offerings, calendar);
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
						section_codes: codes.join(",")
					});
					courses.forEach(({offerings}) => offerings.forEach((offering) => {if (!containsOffering(offering, scheduleName)) addOffering(offering, scheduleName)}));
				
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

		addOfferingsToCalendar([offering], calendar);
		
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

		removeOfferingsFromCalendar([offering], calendar);

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

export default App