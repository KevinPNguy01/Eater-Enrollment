import { useContext } from "react";
import { DropDown, SearchList, SearchBox } from "../..";
import { SearchButton } from "./SearchButton";
import { SearchContext } from "../../CoursesWindow/Courses";

export function SearchForms() {
    const {
        searchResultsVisibility,
        courseSuggestions, setCourseSuggestions,
        setCourseInput,
        term, setTerm,
        year, setYear
    } = useContext(SearchContext);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!courseSuggestions.length) return;
        setCourseInput("");
        setCourseSuggestions([]);
    }

    return (
        <form autoComplete="off" id="searchForm" className={`flex flex-col h-1 grow ${searchResultsVisibility ? "hidden" : "block"}`} onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
                <DropDown
                    label = "Term"
                    name = "term"
                    options={[
                        "Fall", "Winter", "Spring", 
                        "Summer Session 1", "Summer Session 2", "10-wk Summer"
                    ]}
                    default={term}
                    setter={setTerm}
                />
                <DropDown
                    label = "Year"
                    name = "year"
                    options={Array.from({ length: new Date().getFullYear() - 2015 + 2}, (_, index) => (new Date().getFullYear()+1 - index).toString())}
                    default={year}
                    setter={setYear}
                />
            </div>
            <br></br>
            <SearchBox/>
            {courseSuggestions.length ? <SearchList/> : <SearchButton/>}
        </form>
    )
}