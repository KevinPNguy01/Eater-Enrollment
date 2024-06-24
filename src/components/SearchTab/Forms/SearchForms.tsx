import { useContext } from "react";
import { DropDown, SearchContext, SearchList, SearchBox } from "../..";
import { getCourse, getSchedule } from "./FormHelpers";
import { Course, CourseOffering, SearchFields } from "../../../constants/types";

export function SearchForms() {
    const {
        searchResultsVisibility, setSearchResultsVisibility,
        setSearchResults,
        courseSuggestions, setCourseSuggestions,
        courseInput, setCourseInput
    } = useContext(SearchContext);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!courseSuggestions.length) return;
        const fields = event.target as typeof event.target & SearchFields;
        const department = courseInput.split("-")[0];
        const number = courseInput.split("-")[1];
        setCourseInput("");
        setCourseSuggestions([]);
        setSearchResultsVisibility(true);
        if (number != "") {
            setSearchResults([await getCourse(fields.term.value, fields.year.value, department, number)]);
        } else {
            const offerings = (await getSchedule(fields.term.value, fields.year.value, department)).filter(offering => !!offering.course);
            const courses = new Map<string, CourseOffering[]>();
            offerings.forEach((offering) => {
                const key = `${offering.course.id}\n${offering.course.department}\n${offering.course.number}\n${offering.course.title}`
                if (!courses.has(key)) {
                    courses.set(key, []);
                }
                courses.get(key)!.push(offering);
            });
            setSearchResults(Array.from(courses.entries()).map(([courseString, offerings]) => {
                const [id, department, number, title] = courseString.split("\n");
                return {id: id, department: department, number: number, title: title, offerings: offerings} as Course;
            }));
        }
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
            <SearchBox/>
            <SearchList/>
        </form>
    )
}