import { useContext } from "react";
import { SearchContext } from "../../../app/pages/CoursesPane";
import { requestSchedule } from "../../../utils/PeterPortal";

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
        setSearchResults([])
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