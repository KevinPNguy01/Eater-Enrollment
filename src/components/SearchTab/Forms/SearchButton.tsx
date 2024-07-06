import { useContext } from "react";
import { requestSchedule } from "../../../helpers/PeterPortal";
import { SearchContext } from "../../CoursesWindow/Courses";

export function SearchButton() {
    const {
        setSearchResultsVisibility,
        setSearchResults,
        setCourseSuggestions,
        setCourseInput,
        queries,
        callBack
    } = useContext(SearchContext);

    const handleSubmit = async () => {
        setCourseInput("");
        setCourseSuggestions([]);
        setSearchResultsVisibility(true);
        const courses = await requestSchedule(queries, callBack);
        setSearchResults(courses);
    }
    return (
        <div className="flex w-full content-center justify-center">
            <p className="bg-primary w-1/2 p-1 m-8 rounded text-center hover:cursor-pointer" onClick={handleSubmit}>
                Search
            </p>
        </div>
    )
}