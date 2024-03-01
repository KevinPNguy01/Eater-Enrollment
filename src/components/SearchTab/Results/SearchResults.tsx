import { SearchResultsNavBar, SearchContext, CourseResult } from "../.."
import { useContext } from "react";

export function SearchResults() {
    const { searchResultsVisibility, searchResults } = useContext(SearchContext);
    return (
        <div className={`h-full flex flex-col ${searchResultsVisibility ? "block" : "hidden"}`}>
            <SearchResultsNavBar/>
            <div className="h-1 overflow-y-scroll flex-grow">
                {searchResults.map((course) => (
                    <CourseResult key={`${course.department} ${course.number}`} course={course}/>
                ))}
            </div>
        </div>
    )
}