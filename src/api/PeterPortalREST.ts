import { CourseOffering } from "types/CourseOffering";
import { ScheduleQuery } from "types/ScheduleQuery";
import { restToGraphQL } from "utils/RestToGraphQL";

/**
 * Makes a request to the PeterPortal REST API.
 * @param query 
 * @returns The data fetched from the API.
 */
async function makeRequest(query: ScheduleQuery) {
    const { year, quarter, section_codes } = query;
    const response = await fetch(`https://api.peterportal.org/rest/v0/schedule/soc?term=${year}%20${quarter}&sectionCodes=${section_codes}`);
    return (await response.json());
}

/**
 * Requests a schedule from the PeterPortal REST API with the given offerings, using their section codes.
 * Offerings must all be from the same quarter and year.
 * @returns A list of courses representing the schedule.
 */
export async function requestSchedule(offerings: CourseOffering[]) {
    if (!offerings.length) {
        return [];
    }
    // Get section codes from each offering and sort them.
    const codes = offerings.map(({ section: { code } }) => parseInt(code)).toSorted();

    // Combine sequences of continuous section codes into a single, hyphenated string.
    const sequences: string[] = [];
    let start = codes[0];
    let end = codes[0];
    for (let i = 1; i < codes.length; ++i) {
        if (codes[i] !== end + 1) {
            sequences.push(start === end ? `${start}` : `${start}-${end}`);
            start = codes[i];
        }
        end = codes[i];
    }
    sequences.push(start === end ? `${start}` : `${start}-${end}`);

    // Request the schedule from the PeterPortal REST API but convert it into the GraphQL types.
    const query = {
        year: offerings[0].year,
        quarter: offerings[0].quarter,
        section_codes: sequences.join(",")
    } as ScheduleQuery;
    const response = await makeRequest(query);
    return restToGraphQL(response, query.year, query.quarter);
}