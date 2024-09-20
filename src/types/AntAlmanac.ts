export type AntAlmanac = {
    scheduleIndex: number
    schedules: {
        courses: {
            color: string
            sectionCode: string
            term: string
        }[]
        customEvents: {
            color: string
            start: string
            days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean]
            end: string
            title: string
        }[],
        scheduleName: string
        scheduleNote: string
    }[]
}