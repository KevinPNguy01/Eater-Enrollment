import { Course } from "types/Course"
import { CourseOffering } from "types/CourseOffering"
import { Instructor } from "types/Instructor"
import { Meeting } from "types/Meeting"

type _School = {
    schoolName: string
    schoolComment: string
    departments: _Department[]
}

type _Department = {
    deptName: string
    deptCode: string
    deptComment: string
    courses: _Course[]
}

type _Course = {
    courseNumber: string
    courseTitle: string
    courseComment: string
    prerequisiteLink: string
    sections: _Section[]
}

type _Section = {
    sectionCode: string
    sectionType: string
    sectionNum: string
    units: string
    instructors: string[]
    meetings: { days: string, time: string, bldg: string }[]
    finalExam: string
    maxCapacity: string
    numCurrentlyEnrolled: { totalEnrolled: string, sectionEnrolled: string }
    numOnWaitlist: string
    numRequested: string
    numNewOnlyReserved: string
    restrictions: string
    status: string
    sectionComment: string
}

export function restToGraphQL(data: { schools: _School[] }, year: string, quarter: string) {
    const offerings: CourseOffering[] = [];
    data.schools.forEach(
        school => school.departments.forEach(
            department => department.courses.forEach(
                _course => _course.sections.forEach(
                    section => {
                        const offering = {
                            year,
                            quarter,
                            instructors: section.instructors.map(
                                shortened_name => ({ shortened_name } as unknown as Instructor)
                            ),
                            final_exam: section.finalExam,
                            max_capacity: parseInt(section.maxCapacity),
                            meetings: section.meetings.map(
                                ({ bldg, days, time }) => ({ building: bldg, days, time } as Meeting)
                            ),
                            num_section_enrolled: parseInt(section.numCurrentlyEnrolled.sectionEnrolled),
                            num_total_enrolled: parseInt(section.numCurrentlyEnrolled.totalEnrolled),
                            num_new_only_reserved: parseInt(section.numNewOnlyReserved),
                            num_on_waitlist: parseInt(section.numOnWaitlist),
                            num_requested: parseInt(section.numRequested),
                            restrictions: section.restrictions,
                            section: {
                                code: section.sectionCode,
                                comment: section.sectionComment,
                                number: section.sectionNum,
                                type: section.sectionType
                            },
                            status: section.status,
                            units: section.units,
                            course: {
                                id: `${department.deptCode}${_course.courseNumber}`.replaceAll(" ", ""),
                                department: department.deptCode,
                                number: _course.courseNumber,
                                school: school.schoolName,
                                title: _course.courseTitle,
                                course_level: (() => {
                                    const number = parseInt(_course.courseNumber.replace(/\D/g, ""));
                                    return number < 100 ? "Lower Divison" : number < 200 ? "Upper Division" : "Graduate";
                                })(),
                                department_alias: [] as string[], // TODO
                                units: [] as number[], // TODO
                                description: "", // TODO
                                department_name: department.deptName,
                                instructor_history: [] as Instructor[], // TODO
                                prerequisite_list: [] as Course[], // TODO
                                prerequisite_text: "", // TODO
                                prerequisite_for: [] as Course[], // TODO
                                repeatability: "", // TODO
                                concurrent: "", // TODO
                                same_as: "", // TODO
                                restriction: "", // TODO
                                overlap: "", // TODO
                                corequisite: "", // TODO
                                ge_list: [] as string[], // TODO
                                ge_text: "", // TODO
                                terms: [] as string[], // TODO
                                offerings: [] as CourseOffering[] // TODO
                            }
                        } as CourseOffering;
                        offerings.push(offering);
                    }
                )
            )
        )
    );
    console.log(offerings)
    return offerings;
}