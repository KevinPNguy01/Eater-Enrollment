import { useContext } from "react";
import { SearchContext } from "../..";

export function SearchList() {
    const { courseSuggestions, setCourseInput } = useContext(SearchContext);
    return (
        <div className="grid rounded-xl max-h-full mx-1 my-4 overflow-y-scroll">
            {courseSuggestions.map((course) => (
                <button 
                    key={`${course.department}${course.number}`} 
                    className="search-course-option p-2"
                    type="submit"
                    onClick={() => setCourseInput(`${course.department}-${course.number}`)}
                >
                    {`${course.department} ${course.number}: ${course.title}`}
                </button>
            ))}
        </div>
    )
}