import { useContext } from "react"
import { SearchContext } from "../.."
import { autoSuggest } from "../../../helpers/FormHelpers";
import { QueryBubble } from "./QueryBubble";
import { requestSchedule } from "../../../helpers/PeterPortal";

export function SearchBox(props: {callBack: () => void}) {
    const { courseInput, setCourseInput, setCourseSuggestions, setSearchResults, setSearchResultsVisibility, queries, setQueries} = useContext(SearchContext);
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
                        const courses = await requestSchedule(queries, props.callBack);
                        setQueries([])
                        setSearchResults(courses);
                    }
                }}
            />
        </div>
    )   
}