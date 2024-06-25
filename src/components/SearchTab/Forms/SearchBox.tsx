import { useContext } from "react"
import { SearchContext } from "../.."
import { autoSuggest } from "./FormHelpers";

export function SearchBox() {
    const { courseInput, setCourseInput, setCourseSuggestions } = useContext(SearchContext);
    return (
        <input 
            className="mx-1"
            name="course"
            placeholder="Search"
            value={courseInput}
            id="searchBox"
            onChange={(e) => setCourseInput(e.target.value)}
            onInput={(e) => autoSuggest(e.currentTarget.value, setCourseSuggestions)}
        />
    )   
}