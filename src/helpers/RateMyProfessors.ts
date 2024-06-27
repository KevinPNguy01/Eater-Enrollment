import { Course, CourseOffering } from "../constants/types";

export async function populateReviews(courses: Course[], callBack=()=>{}) {
    // Map of instructor names to offerings they teach.
    const instructorOfferings = new Map<string, CourseOffering[]>();
    for (const course of courses) {
        for (const offering of course.offerings) {
            for (const instructor of offering.instructors) {
                const name = instructor.shortened_name;
                if (name === "STAFF") continue;
                if (!instructorOfferings.has(instructor.shortened_name)) {
                    instructorOfferings.set(instructor.shortened_name, []);
                }
                instructorOfferings.get(instructor.shortened_name)!.push(offering);
            }
        }
    }

    for (const [instructor, offerings] of instructorOfferings) {
        (async () => {
            const rating = await searchProfessor(instructor);
            if (rating) {
                offerings.forEach(offering => offering.rmp = rating);
                callBack();
            }
        })();
        await new Promise(r => setTimeout(r, 500));
    }
}

export async function searchProfessor(shortened_name: string) {
    const name = shortened_name;
    const [lastName, firstInitial] = name.toLowerCase().split(", ");
    let rating = null;
    await fetch(`/api/professors?q=${name.replace(/,/g, '').replace(/\./g, '')}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text(); // Read the response as text
        })
        .then(html => {
            const el = document.createElement("html");
            el.innerHTML = html;
            const scripts = el.getElementsByTagName("script");
            let text = ""
            for (const script of scripts) {
                text += script.innerHTML;
            }
            const teachers = text.split('"__typename":"Teacher",').slice(1);
            for (const teacher of teachers) {
                const data = new Map<string, string>();
                teacher.replace(/"/g, '').split(",").forEach(pair => {
                    const [key, value] = pair.split(":");
                    data.set(key, value);
                })

                if (data.get("lastName")?.toLowerCase() === lastName && data.get("firstName")?.toLowerCase().startsWith(firstInitial[0])) {
                    const rmp = data.get("avgRating");
                    const url = `https://www.ratemyprofessors.com/professor/${data.get("legacyId")}`;
                    if (rmp) {
                        rating = parseFloat(rmp);
                        break;
                    }
                }
            }
        })
        .catch(error => console.error('Error:', error));
    return rating;
}
