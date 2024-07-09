import { useContext } from "react";
import { SearchContext } from "../../../app/pages/CoursesPane";
import { autoSuggest } from "../../../utils/FormHelpers";
import { requestSchedule } from "../../../utils/PeterPortal";
import { QueryBubble } from "./QueryBubble";

export function SearchBox() {
    const { courseInput, setCourseInput, setCourseSuggestions, setSearchResults, setSearchResultsVisibility, queries, callBack} = useContext(SearchContext);
    return (
        <div className="flex border-b">
            {queries.map((query, index) => <QueryBubble query={query} index={index}/>)}
            <input 
                className="m-1 w-full border-0"
                name="course"
                placeholder="Search"
                value={courseInput}
                id="searchBox"
                onChange={(e) => setCourseInput(e.target.value)}
                onInput={(e) => autoSuggest(e.currentTarget.value, setCourseSuggestions)}
                onKeyDown={async (e) => {
                    if (e.key === "Enter" && !courseInput.length && queries.length) {
                        setCourseInput("");
                        setCourseSuggestions([]);
                        setSearchResultsVisibility(true);
                        setSearchResults([]);
                        const courses = await requestSchedule(queries, callBack);
                        setSearchResults(courses);
                    }
                }}
            />
        </div>
    )   
}