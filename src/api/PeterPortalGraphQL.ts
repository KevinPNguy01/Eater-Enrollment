import { aggregatedGrades } from "helpers/GradeDistributionCollection";
import { Course } from "types/Course";
import { CourseOffering } from "types/CourseOffering";
import { GradeDistribution } from "types/GradeDistribution";
import { GradeDistributionCollection } from "types/GradeDistributionCollection";
import { ScheduleQuery } from "types/ScheduleQuery";
import { WebsocResponse } from "types/AnteaterAPI";
import { Instructor } from "types/Instructor";
import { Meeting } from "types/Meeting";
import { SectionInfo } from "types/SectionInfo";
import { parseMeeting } from "utils/ParseMeeting";

/**
 * Makes a request to the PeterPortal GraphQL API.
 * @param query 
 * @returns The data fetched from the API.
 */
async function makeRequest(query: string) {
    const response = await fetch("https://anteaterapi.com/v2/graphql",
        {
            method: 'POST',
            headers: { 
                'content-type': 'application/json',
                Authorization: "Bearer 13604MytBc54PSnIBf4KZ7zLYlgWBzFKg6Rc91tm00Q.sk.vpvujamvf419g0r43yioi5m4",
            },
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
        schools {
            departments {
                courses {
                    courseTitle deptCode courseNumber
                    sections {
                        maxCapacity numOnWaitlist numNewOnlyReserved status restrictions units sectionCode sectionType sectionNum
                        meetings { bldg days startTime { hour minute } endTime { hour minute } }
                        instructors
                        numCurrentlyEnrolled { sectionEnrolled totalEnrolled }
                        finalExam { dayOfWeek day month startTime { hour minute } endTime { hour minute } }
                    }
                }
            }
        }
    `;

    // Build a separate GraphQL query for each of the given queries.
    const buildSubQuery = (query: ScheduleQuery): string => {
        const { quarter, year, department, section_codes, number, ge } = query;

        // API has a limit of 10 codes per query, so split them into chunks.
        const codes = (section_codes || "").split(",");
        const codeChunks: string[][] = [];
        for (let i = 0; i < codes.length; i += 100) {
            codeChunks.push(codes.slice(i, i + 100));
        }

        // Create a subquery for each chunk of 10 section codes.
        return codeChunks.map((section_codes) => `
        schedule${numQueries++}: websoc(query: {
            quarter: ${quarter}
            year: "${year}"
            ${department ? `department: "${department}"` : ""}
            ${section_codes ? `sectionCodes: "${section_codes}"` : ""}
            ${number ? `courseNumber: "${number}"` : ""}
            ${ge ? `ge: "${ge}"` : ""}
        }) {${offeringFragment}}`.replace(/\n+/g, ' ')).join("\n");
    };

    // The actual GraphQL query.
    const query = `
        query {
            ${queries.map(buildSubQuery)}
        }
    `.replace(/ +/g, ' ');

    const queryMap: Record<number, [string, string]> = Object.fromEntries(queries.map(({year, quarter}, index) => [index, [year, quarter]]));

    const response = await makeRequest(query);
    
    return anteaterToPeterPortal(queryMap, response.data);
}

/**
 * Requests grades from the PeterPortal GraphQL API for the given courses.
 * @returns
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

function anteaterToPeterPortal(queryMap: Record<number, [string, string]>, data: Record<string, WebsocResponse>) : CourseOffering[] {
    const offerings = [] as CourseOffering[];
    for (const [index, pair] of Object.entries(queryMap)) {
        const [year, quarter] = pair;
        const response = data["schedule"+index];
        for (const websocSchool of response.schools) {
            for (const websocDepartment of websocSchool.departments) {
                for (const websocCourse of websocDepartment.courses) {
                    const course = {
                        id: websocCourse.deptCode.replace(" ", "") + websocCourse.courseNumber,
                        department: websocCourse.deptCode,
                        number: websocCourse.courseNumber
                    } as Course;
                    for (const websocSection of websocCourse.sections) {
                        const {dayOfWeek, day, month, startTime, endTime} = websocSection.finalExam;
                        const finalTime = startTime && endTime ? `${startTime.hour % (startTime.hour >= 13 ? 12 : 24)}:${("0"+startTime.minute).slice(-2)}-${endTime.hour % (endTime.hour >= 13 ? 12 : 24)}:${("0"+endTime.minute).slice(-2)}${endTime.hour >= 12 ? "pm" : "am"}` : "";
                        const finalString = finalTime ? `${dayOfWeek} _ _ ${finalTime}` : ""
                        console.log(websocSection.finalExam, finalString);
                        const offering = {
                            year: year,
                            quarter: quarter,
                            instructors: websocSection.instructors.map(
                                instructor => ({shortened_name: instructor} as Instructor)
                            ),
                            final_exam: finalString,
                            max_capacity: parseInt(websocSection.maxCapacity),
                            meetings: websocSection.meetings.map(
                                meeting => {
                                    const {bldg, days, startTime, endTime} = meeting;
                                    return {
                                        building: bldg ? bldg[0] : "TBA",
                                        days: days || "TBA",
                                        time: startTime && endTime ? `${startTime.hour % (startTime.hour >= 13 ? 12 : 24)}:${("0"+startTime.minute).slice(-2)}-${endTime.hour % (endTime.hour >= 13 ? 12 : 24)}:${("0"+endTime.minute).slice(-2)} ${endTime.hour >= 12 ? "pm" : "am"}` : ""
                                    } as Meeting
                                }
                            ),
                            num_section_enrolled: parseInt(websocSection.numCurrentlyEnrolled.sectionEnrolled),
                            num_total_enrolled: parseInt(websocSection.numCurrentlyEnrolled.totalEnrolled),
                            num_new_only_reserved: websocSection.numNewOnlyReserved === "" ? "N/A" : parseInt(websocSection.numNewOnlyReserved),
                            num_on_waitlist: websocSection.numOnWaitlist === "" ? "N/A" : parseInt(websocSection.numOnWaitlist),
                            num_requested: parseInt(websocSection.numRequested),
                            restrictions: websocSection.restrictions,
                            section: {
                                code: websocSection.sectionCode,
                                comment: websocSection.sectionComment,
                                number: websocSection.sectionNum,
                                type: websocSection.sectionType
                            } as SectionInfo,
                            status: websocSection.status,
                            units: websocSection.units,
                            course: course,
                            grades: {} as GradeDistributionCollection,
                            parsed_meetings: [],
                            final: null,
                            color: ""
                        } as CourseOffering;
                        offering.parsed_meetings = offering.meetings.map(meeting => parseMeeting(meeting));
                        offerings.push(offering);
                    }
                }
            }
        }
    }
    return offerings;
}