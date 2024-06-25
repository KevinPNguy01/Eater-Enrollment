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
