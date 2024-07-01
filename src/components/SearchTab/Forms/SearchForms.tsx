import { useContext } from "react";
import { DropDown, SearchContext, SearchList, SearchBox } from "../..";
import { SearchFields } from "../../../constants/types";
import { SearchButton } from "./SearchButton";

export function SearchForms(props: {callBack: () => void}) {
    const {
        searchResultsVisibility,
        courseSuggestions, setCourseSuggestions,
        courseInput, setCourseInput,
        queries, setQueries
    } = useContext(SearchContext);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!courseSuggestions.length) return;
        const fields = event.target as typeof event.target & SearchFields;
        const department = courseInput.split("-")[0];
        const number = courseInput.split("-")[1];
        setCourseInput("");
        setCourseSuggestions([]);
        setQueries(queries.concat([{
            quarter: fields.term.value,
            year: fields.year.value,
            department: department,
            number: number
        }]));
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
                    default="Fall"
                />
                <DropDown
                    label = "Year"
                    name = "year"
                    options={Array.from({ length: new Date().getFullYear() - 2015 + 2}, (_, index) => (new Date().getFullYear()+1 - index).toString())}
                    default={"2024"}
                />
            </div>
            <br></br>
            <SearchBox callBack={props.callBack}/>
            {courseSuggestions.length ? <SearchList/> : <SearchButton callBack={props.callBack}/>}
        </form>
    )
}