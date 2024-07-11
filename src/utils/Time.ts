/**
 * @param time The times to parse as a string.
 * @returns Two numbers representing the start/end times represented by the given time string.
 */
export function parseTime(time: string) {
    time = time.replace(/\s+/g, "").replace("am", "").replace("pm", "p")    // Normalize string.
    const pm = time[time.length-1] === "p" ? true : false;                  // The time ends past 12 if the string ends in 'p'.
    const timeArray = time.replace("p", "").split("-");                     // Drop the p and split by '-' into two separate times.

    // Isolate the start/end hours and minutes.
    const startArray = timeArray[0].split(":");             
    const endArray = timeArray[1].split(":");
    let startHour = parseInt(startArray[0]);
    const startMinutes = parseInt(startArray[1]);
    let endHour = parseInt(endArray[0]);
    const endMinutes = parseInt(endArray[1]);

    // If the end time is in the pm, add 12 to the hours.
    if (pm) {
        startHour += 12;
        endHour += 12;
    }

    // Adjust for if the end time is actually at 12.
    if (endHour >= 24) {
        endHour = 12;
    }

    // Make sure start hour <= end hour.
    if (startHour > endHour) {
        startHour -= 12;
    }

    return [startHour * 60 + startMinutes, endHour * 60 + endMinutes];
}