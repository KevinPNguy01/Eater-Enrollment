import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { requestSchedule } from "api/PeterPortalGraphQL";
import { groupOfferings, offeringEquals } from "helpers/CourseOffering";
import { customEventFromString, customEventToString } from "helpers/CustomEvent";
import { scheduleAddCustomEvent } from "helpers/Schedule";
import { scheduleSetAdd } from "helpers/ScheduleSet";
import { enqueueSnackbar } from "notistack";
import { CourseOffering } from "types/CourseOffering";
import { Schedule } from "types/Schedule";
import { ScheduleQuery } from "types/ScheduleQuery";
import superjson from "superjson";
import { AntAlmanac, AntAlmanacUser } from "types/AntAlmanac";
import moment from "moment";
import { CustomEvent } from "types/CustomEvent";
import { AppRouter } from "api/routers";
import { buildingIds } from "constants/BuildingIds";

const saveUserUrl = "https://saveuser-htn7okprja-uc.a.run.app";
const loadUserUrl = "https://loaduser-htn7okprja-uc.a.run.app";
const trpc = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: "https://api.antalmanac.com/trpc",
            transformer: superjson
        }),
    ],
});

/**
 * Convert the session data into a string and send it to the backend to store in the database.
 * @param username 
 * @param scheduleSet 
 * @param currentScheduleIndex 
 */
export async function saveUser(username: string, scheduleSet: Schedule[], currentScheduleIndex: number) {
    // Convert the schedule set into a list of strings.
    const scheduleSetString = scheduleSet.map(schedule => {
        // Convert offerings to a comma-separated string.
        const offeringsString = schedule.courses.map(
            ({ offerings }) => offerings.map(
                ({ quarter, year, section, color }) => `${quarter} ${year} ${section.code} ${color}`
            )
        ).join(",");
        // Convert custom events into a list string.
        const customEventsString = JSON.stringify(schedule.customEvents.map(
            event => customEventToString(event)
        ));
        return JSON.stringify({
            name: schedule.name,
            offerings: offeringsString,
            custom: customEventsString
        });
    }).join("\n");

    // Send data to the backend.
    const response = await fetch(saveUserUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, scheduleSetString, currentScheduleIndex }),
    });

    // Show status message to user depending on the response.
    if (response.ok) {
        enqueueSnackbar(`Scheduled saved under "${username}"`, { variant: "success" });
    } else {
        enqueueSnackbar(`Error saving schedule "${username}"`, { variant: "error" });
    }
}

/**
 * Load the schedule set and selected index for a user.
 * @param userId 
 * @returns A state object containing the schedule set and index, or undefined if the user data couldn't be fetched. 
 */
export async function loadUser(userId: string) {
    const response = await fetch(`${loadUserUrl}/${userId}`);

    // Send error message if the backend returned an error.
    if (!response.ok) {
        enqueueSnackbar(`Unable to load schedule for "${userId}"`, { variant: "error" });
        return;
    }
    const { scheduleSetString, selectedIndex }: { scheduleSetString: string, selectedIndex: number } = await response.json();
    // Send error message if the schedule doesn't exist.
    if (!scheduleSetString) {
        enqueueSnackbar(`No schedule found for "${userId}"`, { variant: "error" });
        return;
    }

    // Flatten course offering strings from schedule set string.
    const offeringsStrings = scheduleSetString.split("\n").map(
        scheduleString => (JSON.parse(scheduleString).offerings as string).split(",")
            .filter(s => s)             // Filter out empty strings.
            .map(s => s.split(" "))
    ).flat();

    // Group section codes by similar terms.
    const groupedOfferingStrings = Object.groupBy(offeringsStrings, s => s.slice(0, 2).join(" "));

    // Map each group of section codes into ScheduleQueries.
    const queries = Object.entries(groupedOfferingStrings).map(([key, strings]) => {
        const [quarter, year] = key.split(" ");
        const query = {
            quarter,
            year,
            section_codes: strings!.map(s => s[2]).join(",")
        } as ScheduleQuery;
        return query;
    });

    // Build the state to store in redux from the fetched course offerings.
    const offerings = await requestSchedule(queries);
    const state = { scheduleSet: [] as Schedule[], selectedIndex: 0 };
    state.selectedIndex = selectedIndex;
    // Process each schedule string.
    scheduleSetString.split("\n").forEach(scheduleString => {
        const { name, offerings: offeringsString, custom: customEventsString }: { name: string, offerings: string, custom: string } = JSON.parse(scheduleString);
        // Add schedule object.
        const schedule = { id: -1, name, courses: [], customEvents: [] } as Schedule;
        scheduleSetAdd(state.scheduleSet, schedule);

        // Process each offering string to a CourseOffering object and group them by course.
        schedule.courses = groupOfferings(offeringsString.split(",").map(offeringString => {
            // Skip empty strings in the case of a schedule with no offerings.
            if (!offeringString) return;

            // Find the offering in the array of offerings fetched previously.
            const [quarter, year, code, color] = offeringString.split(" ");
            const offeringCompare = { quarter, year, section: { code } } as CourseOffering;
            const offering = offerings.find(offering => offeringEquals(offering, offeringCompare));

            // Set the offering color and return it.
            if (offering) {
                offering.color = color;
                return offering;
            }
        }).filter(o => o) as CourseOffering[]);

        // Process each custom event string and add them to the schedule.
        JSON.parse(customEventsString).forEach((customEventString: string) => {
            const customEvent = customEventFromString(customEventString);
            scheduleAddCustomEvent(schedule, customEvent);
        });
    });

    // Send success and save the user id if everything went well.
    enqueueSnackbar(`Loaded schedule for "${userId}"`, { variant: "success" });
    localStorage.setItem("userID", userId);
    return state;
}

export async function importUser(userId: string) {
    let data = (await trpc.users.getUserData.query({ userId }));
    // Send error message if the backend returned an error.
    if (!data) {
        enqueueSnackbar(`No schedule found for "${userId}"`, { variant: "error" });
        return;
    }
    data = "userData" in data ? (data as AntAlmanacUser).userData : data as AntAlmanac;

    // Flatten courses from schedules into on array.
    const courses = data.schedules.map(({ courses }) => courses.map(courses => courses)).flat();

    // Group courses by similar terms.
    const groupedOfferings = Object.groupBy(courses, offering => offering.term);

    // Map each group of section codes into ScheduleQueries.
    const queries = Object.entries(groupedOfferings).map(([term, offerings]) => {
        const [year, quarter] = term.split(" ");
        const query = {
            quarter,
            year,
            section_codes: offerings!.map(({ sectionCode }) => sectionCode).join(",")
        } as ScheduleQuery;
        return query;
    });

    // Build the state to store in redux from the fetched course offerings.
    const offerings = await requestSchedule(queries);
    const state = { scheduleSet: [] as Schedule[], selectedIndex: data.scheduleIndex };

    // Process each schedule from AntAlmanac.
    data.schedules.forEach(schedule => {
        const { scheduleName: name } = schedule;
        // Add schedule object.
        const newSchedule = { id: -1, name, courses: [], customEvents: [] } as Schedule;
        scheduleSetAdd(state.scheduleSet, newSchedule);

        // Process each offering string to a CourseOffering object and group them by course.
        newSchedule.courses = groupOfferings(schedule.courses.map(antOffering => {
            // Find the offering in the array of offerings fetched previously.
            const { sectionCode: code, color } = antOffering;
            const [year, quarter] = antOffering.term.split(" ");
            const offeringCompare = { quarter, year, section: { code } } as CourseOffering;
            const offering = offerings.find(offering => offeringEquals(offering, offeringCompare));

            // Set the offering color and return it.
            if (offering) {
                offering.color = color;
                return offering;
            }
        }).filter(o => o) as CourseOffering[]);

        schedule.customEvents.forEach(antEvent => {
            let days = 0;
            antEvent.days.forEach((day, index) => {
                if (day) {
                    days += Math.pow(2, 6 - index);
                }
            });
            const location = antEvent.building ? Object.keys(buildingIds).find(key => `${buildingIds[key]}` === antEvent.building) : "";
            const customEvent = {
                id: -1,
                title: antEvent.title,
                description: "",
                startTime: moment(antEvent.start, "HH:mm").format("hh:mm A"),
                endTime: moment(antEvent.end, "HH:mm").format("hh:mm A"),
                color: antEvent.color,
                days,
                location
            } as CustomEvent;
            scheduleAddCustomEvent(newSchedule, customEvent);
        });
    });

    // Send success and save the user id if everything went well.
    enqueueSnackbar(`Imported schedule for "${userId}"`, { variant: "success" });
    localStorage.setItem("userID", userId);
    return state;
}