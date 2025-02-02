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

export type RawGrade = {
    averageGPA: number
    courseNumber: string
    coourseNumeric: number
    department: string
    geCategories: string[]
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeFCount: number
    gradeNPCount: number
    gradePCount: number
    gradeWCount: number
    instructors: string[]
    quarter: Term
    sectionCode: string
    year: string
}

export enum Term {
    Fall = "Fall",
    Spring = "Spring",
    Summer1 = "Summer1",
    Summer10wk = "Summer10wk",
    Summer2 = "Summer2",
    Winter = "Winter"
}