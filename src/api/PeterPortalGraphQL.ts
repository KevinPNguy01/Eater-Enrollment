import { offeringEquals } from "helpers/CourseOffering";
import { aggregatedGrades } from "helpers/GradeDistributionCollection";
import { Course } from "types/Course";
import { CourseOffering } from "types/CourseOffering";
import { GradeDistribution } from "types/GradeDistribution";
import { GradeDistributionCollection } from "types/GradeDistributionCollection";
import { ScheduleQuery } from "types/ScheduleQuery";
import { requestSchedule as requestRestSchedule } from "./PeterPortalREST";

/**
 * Makes a request to the PeterPortal GraphQL API.
 * @param query 
 * @returns The data fetched from the API.
 */
async function makeRequest(query: string) {
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ 'query': query })
        }
    );
    return (await response.json());
}

/**
 * Requests a schedule from the Peter Portal GraphQL API with the given arguments.
 * @returns A list of courses representing the schedule.
 */
export async function requestSchedule(queries: ScheduleQuery[]): Promise<CourseOffering[]> {
    let numQueries = 0;

    // The fields to select on CourseOffering.
    const offeringFragment = `
    fragment offeringFields on CourseOffering {
        quarter year num_total_enrolled max_capacity num_on_waitlist num_new_only_reserved status restrictions final_exam units
        meetings { time days building }
        section { code type number }
        instructors { shortened_name }
        course { id department number title }
    }`;

    // Build a separate GraphQL query for each of the given queries.
    const buildSubQuery = (query: ScheduleQuery): string => {
        const { quarter, year, department, section_codes, number, ge } = query;

        // API has a limit of 10 codes per query, so split them into chunks.
        const codes = (section_codes || "").split(",");
        const codeChunks: string[][] = [];
        for (let i = 0; i < codes.length; i += 10) {
            codeChunks.push(codes.slice(i, i + 10));
        }

        // Create a subquery for each chunk of 10 section codes.
        return codeChunks.map((section_codes) => `
        schedule${numQueries++}: schedule(
            quarter: "${quarter}"
            year: ${year}
            ${department ? `department: "${department}"` : ""}
            ${section_codes ? `section_codes: "${section_codes}"` : ""}
            ${number ? `course_number: "${number}"` : ""}
            ${ge ? `ge: "${ge}"` : ""}
        ) {...offeringFields}`.replace(/\n+/g, ' ')).join("\n");
    };

    // The actual GraphQL query.
    const query = `
        ${offeringFragment}
        query {
            ${queries.map(buildSubQuery)}
        }
    `.replace(/ +/g, ' ');

    // The schedule query returns a list of course offerings.
    const offerings = [] as CourseOffering[];
    const missingOfferings = [] as CourseOffering[];
    const response = await makeRequest(query);

    // Combine offerings from all of the queries.
    for (let i = 0; i < numQueries; ++i) {
        (response.data[`schedule${i}`] as CourseOffering[]).forEach(offering => {
            // Add offering if it is not a duplicate.
            if (!offerings.find(otherOffering => offeringEquals(offering, otherOffering))) {
                (offering.course ? offerings : missingOfferings).push(offering);
            }
        });
    }

    // Get missing offerings from REST API and combine with other offerings.
    if (missingOfferings) {
        (await requestRestSchedule(missingOfferings)).forEach(
            offering => {
                offerings.push(offering);
            }
        );
    }

    return offerings;
}

/**
 * Requests grades from the PeterPortal GraphQL API for the given courses.
 * @returns A map of "<department> <number> <instructor>" to GradeDistributions.
 */
export async function requestGrades(courses: Course[]) {
    // The fields to select on GradeDistributionCollection.
    const gradesFragment = `
    fragment gradeFields on GradeDistributionCollection {
        grade_distributions{
            average_gpa grade_a_count grade_b_count grade_c_count grade_d_count grade_f_count grade_p_count grade_np_count grade_w_count
            course_offering {
                course { department number }
                section { type }
                instructors {shortened_name }
            }
        }
    }`;

    // Build a separate GraphQL query for each of the given queries.
    const buildSubQuery = (course: Course, index: number): string => {
        const { department, number } = course;
        return `
        course${index}: grades(
            ${department ? `department: "${department}"` : ""}
            ${number ? `number: "${number}"` : ""}
        ) {...gradeFields}`;
    };

    // The actual GraphQL query.
    const query = `
        ${gradesFragment}
        query {
            ${courses.map(buildSubQuery)}
        }
    `.replace(/ +/g, ' ');

    // Combine all of the GradeDistributionCollections from all the subqueries.
    const response = await makeRequest(query);
    const grades = { grade_distributions: [] as GradeDistribution[] } as GradeDistributionCollection;
    courses.forEach((_, index) => {
        const courseGrades = response.data[`course${index}`] as GradeDistributionCollection;
        courseGrades.grade_distributions.forEach(grade => grades.grade_distributions.push(grade));
    });

    return aggregatedGrades(grades);
}