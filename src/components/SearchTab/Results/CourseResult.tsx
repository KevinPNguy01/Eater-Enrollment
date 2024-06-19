import { Course, CourseOffering } from "../../../constants/types";
import { useContext } from "react";
import { AddedCoursesContext, CalendarContext } from "../../Main/App";
import { CalendarApi } from '@fullcalendar/core';
import FullCalendar from "@fullcalendar/react";

export function CourseResult(props: {course: Course}) {
    const course = props.course;
    return (
        <div>
            <p 
                key={`${course.department}${course.number}`}
            >
                {`${course.department} ${course.number}: ${course.title}`}
            </p>
            <table className="h-full table-fixed text-center overflow-x-scroll min-w-full">
                <thead className="text-sm">
                    <tr className="first:bg-tertiary">
                        <th></th>
                        <th className="p-2">Code</th>
                        <th>Type</th>
                        <th>Instructors</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Restrictions</th>
                    </tr>
                </thead>
                <tbody className="text-xs">
                    {course.offerings.map((offering) => {
                        offering.course = course;
                        return (
                            <tr className="odd:bg-quaternary even:bg-tertiary" key={offering.section.code}>
                                <td><CourseCheckBox course={course} offering={offering}/></td>
                                <td className="py-2">{offering.section.code}</td>
                                <td>{offering.section.type}</td>
                                <td>{offering.instructors[0].shortened_name}</td>
                                <td>{`${offering.meetings[0].days} ${offering.meetings[0].time}`}</td>
                                <td>{offering.meetings[0].building}</td>
                                <td>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</td>
                                <td>{offering.status}</td>
                                <td>{offering.restrictions}</td>
                            </tr>)
                        }
                    )}
                </tbody>

            </table>
            <br/>
        </div>
    )
}

function CourseCheckBox(props: {course: Course, offering: CourseOffering}) {
    const addedCourses = useContext(AddedCoursesContext);
    const calendar = (useContext(CalendarContext)!.current! as InstanceType<typeof FullCalendar>).getApi() as CalendarApi;
    const course = props.course;
    const offering = props.offering;

    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            addCourseOffering(offering)
        } else {
            removeCourseOffering(offering);
        }
    };

    /**
     * Adds the given course offering to the calendar and data.
     * @param offering The course offering to add.
     */
    const addCourseOffering = (offering: CourseOffering) => {
        // If the course was never added before, create a new course with empty offerings.
        if (!addedCourses.map((course) => course.id).includes(offering.course.id)) {
            const newCourse = structuredClone(offering.course);
            newCourse.offerings = [];
            addedCourses.push(newCourse);
        }
        addedCourses.find((course) => course.id === offering.course.id)?.offerings.push(offering);

        // Check all the boxes.
        for (const checkbox of document.getElementsByClassName(`checkbox-${offering.course.id}-${offering.section.code}`)) {
            (checkbox as HTMLInputElement).checked = true;
        }

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

        // Add an event to the calendar for each meeting day.
        for (const days of dayOffsets) {
            startTime.setDate(monday.getDate() + days);
            endTime.setDate(monday.getDate() + days);
            calendar.addEvent({
                title: `${course.department} ${course.number} ${offering.section.type}`,
                start: startTime.toISOString(),
                end: endTime.toISOString(),
                id: `${offering.section.code}-${days}`
            });
        } 
    }

    /**
     * Removes the given course offering from the calendar and data.
     * @param offering The course offering to remove.
     */
    const removeCourseOffering = (offering: CourseOffering) => {
        // Remove course offering from appropriate course.
        const addedCourse = addedCourses.find((course) => course.id === offering.course.id);
        const offerings = addedCourse?.offerings;
        const index = offerings?.findIndex((other_offering) => other_offering.section.code === offering.section.code);
        if (offerings && index! > -1) {
            offerings.splice(index!, 1);
        }

        // If the course has no offerings now, remove it.
        if (offerings && offerings.length == 0) {
            addedCourses.splice(addedCourses.findIndex((course) => course == addedCourse));
        }

        // Uncheck all the boxes.
        for (const checkbox of document.getElementsByClassName(`checkbox-${offering.course.id}-${offering.section.code}`)) {
            (checkbox as HTMLInputElement).checked = false;
        }

        // Remove events with matching section codes from the calendar.
        for (let i = 0; i < 5; ++i) {
            const event = calendar.getEventById(`${offering.section.code}-${i}`);
            if (event) event.remove()
        }
    }

    return (
        <input 
            type="checkbox"
            onChange={handleCheckBoxChange}
            className={`checkbox-${offering.course.id}-${offering.section.code}`}
            defaultChecked={
                // Combine all the section codes from every course offering into one array.
                addedCourses.map(
                    (course) => course.offerings.map(
                        (offering) => offering.section.code)
                ).flat().includes(offering.section.code)
            }
        />
    )
}

/**
 * 
 * @returns A Date object representing the monday of the current week.
 */
function getMonday() {
    const d = new Date();
    const day = d.getDay()
    const diff = d.getDate() - day + (day == 0 ? -6 : 1); // Adjust when day is sunday.
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