export type ParsedMeeting = {
    buildingId: number
    room: string
    days: number        // Bit string; Each bit set to 1 represents meeting that day.
    startTime: string   // Format: "hh:mm A"
    endTime: string     // Format: "hh:mm A"
}