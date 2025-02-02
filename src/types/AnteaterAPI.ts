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