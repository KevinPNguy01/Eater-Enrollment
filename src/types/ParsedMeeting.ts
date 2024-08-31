export type ParsedMeeting = {
    buildingId: number
    room: string
    days: number                    // Bit string; Each bit set to 1 represents meeting that day.
    time: [string, string] | null   // Two date strings representing the start and end times of this meeting.
}