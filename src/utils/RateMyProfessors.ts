import { Review } from "types/Review";

export async function requestReviews(instructors: string[]) {
    const reviews = {} as Record<string, Review>;
    for (const instructor of instructors) {
        const review = await searchProfessor(instructor);
        if (review) {
            reviews[instructor] = review;
        }
        await new Promise(r => setTimeout(r, 500));
    }
    return reviews;
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
