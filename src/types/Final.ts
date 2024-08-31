export type Final = {
    day: number                     // Day of the week, with monday starting at 0.
    time: [string, string] | null   //  Two date strings representing the start and end times of this meeting.
}