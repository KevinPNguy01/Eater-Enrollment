export type WebsocResponse = {
    schools: WebsocSchool[]
}

export type WebsocSchool = {
    departments: WebsocDepartment[]
    schoolComment: string
    schoolName: string
    updatedAt: string
}

export type WebsocDepartment = {
    courseNumberRangeComments: string[]
    courses: WebsocCourse[]
    deptCode: string
    deptComment: string
    deptName: string
    sectionCodeRangeComments: string[]
    updatedAt: string
}

export type WebsocCourse = {
    courseComment: string
    courseNumber: string
    courseTitle: string
    deptCode: string
    prerequisiteLink: string
    sections: WebsocSection[]
    updatedAt: string
}

export type WebsocSection = {
    finalExam: WebsocSectionFinalExam
    instructors: string[]
    maxCapacity: string
    meetings: WebsocSectionMeeting[]
    numCurrentlyEnrolled: WebsocSectionCurrentlyEnrolled
    numNewOnlyReserved: string
    numOnWaitlist: string
    numRequested: string
    numWaitlistCap: string
    restrictions: string
    sectionCode: string
    sectionComment: string
    sectionNum: string
    sectionType: SectionType
    status: string
    units: string
    updatedAt: string
}

export type WebsocSectionFinalExam = {
    bldg: string[]
    day: number
    dayOfWeek: string
    endTime: HourMinute
    examStatus: string
    month: number
    startTime: HourMinute
} 

export type WebsocSectionMeeting = {
    bldg: string[]
    days: string
    endTime: HourMinute
    startTime: HourMinute
    timeIsTBA: boolean
}

export type WebsocSectionCurrentlyEnrolled = {
    sectionEnrolled: string
    totalEnrolled: string
}

export enum SectionType {
    Act = "Act",
    Col = "Col",
    Dis = "Dis",
    Fld = "Fld",
    Lab = "Lab",
    Qiz = "Qiz",
    Res = "Res",
    Sem = "Sem",
    Stu = "Stu",
    Tap = "Tap",
    Tut = "Tut"
}

export type HourMinute = {
    hour: number
    minute: number
}

export type AggregateGradeByOffering = {
    averageGPA: number
    courseNumber: string
    department: string
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeFCount: number
    gradeNPCount: number
    gradePCount: number
    gradeWCount: number
    instructor: string
}

export enum Term {
    Fall = "Fall",
    Spring = "Spring",
    Summer1 = "Summer1",
    Summer10wk = "Summer10wk",
    Summer2 = "Summer2",
    Winter = "Winter"
}

export type CoursePreview = {
    courseNumber: string
    department: string
    id: string
    title: string
}

export type InstructorPreview = {
    department: string
    email: string
    name: string
    shortenedNames: string[]
    title: string
    ucinetid: string
}

export type Course = {
    concurrent: string
    corequisites: string
    courseLevel: string
    courseNumber: string
    courseNumeric: number
    department: string
    departmentName: string
    dependencies: CoursePreview[]
    description: string
    geList: string[]
    geText: string
    gradingOption: string
    id: string
    instructors: InstructorPreview[]
    maxUnits: number
    minUnits: number
    overlap: string
    prerequisiteText: string
    prerequisiteTree: any
    prerequisites: CoursePreview[]
    repeatability: string
    restriction: string
    sameAs: string
    school: string
    terms: string[]
    title: string
  };
  