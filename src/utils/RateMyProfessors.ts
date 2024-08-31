import { Course } from "../types/Course";
import { CourseOffering } from "../types/CourseOffering";
import { Review } from "../types/Review";

export async function populateReviews(courses: Course[]) {
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
            const review = await searchProfessor(instructor);
            if (review) {
                offerings.forEach(offering => offering.instructors.filter(({shortened_name}) => shortened_name === instructor).forEach(instructor => instructor.review = review));
            }
        })();
        await new Promise(r => setTimeout(r, 500));
    }
}

export async function searchProfessor(shortened_name: string) {
    const name = shortened_name;
    const [lastName, firstInitial] = name.toLowerCase().split(", ");
    let instructorReview = null as unknown as Review;
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
                    instructorReview = {
                        firstName: data.get("firstName"),
                        lastName: data.get("lastName"),
                        department: data.get("department"),
                        avgRating: parseFloat(data.get("avgRating") || ""),
                        numRatings: parseInt(data.get("numRatings") || ""),
                        wouldTakeAgainPercent: parseFloat(data.get("wouldTakeAgainPercent") || ""),
                        avgDifficulty: parseFloat(data.get("avgDifficulty") || ""),
                        url: `https://www.ratemyprofessors.com/professor/${data.get("legacyId") || ""}`
                    } as Review;
                    break;
                }
            }
        })
        .catch(error => console.error('Error:', error));
    return instructorReview;
}
