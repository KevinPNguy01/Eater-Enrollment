import { Review } from "types/Review";

const professorsUrl = "https://professors-htn7okprja-uc.a.run.app";

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
    await fetch(`${professorsUrl}?q="${name.replace(/,/g, '').replace(/\./g, '')}"`)
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
            const urls = (Array.from(el.getElementsByClassName("TeacherCard__StyledTeacherCard-syjs0d-0")) as HTMLAnchorElement[]).map(({href}) => href.split("/"));
            const ids = urls.map(url => url[url.length-1]);
            for (const script of scripts) {
                text += script.innerHTML;
            }
            const teachers = text.split('"__typename":"Teacher",').slice(1);
            for (let i = 0; i < teachers.length; ++i) {
                const teacher = teachers[i];
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
                        url: `https://www.ratemyprofessors.com/professor/${ids[i]}`
                    } as Review;
                    break;
                }
            }
        })
        .catch(error => console.error('Error:', error));
    return instructorReview;
}
