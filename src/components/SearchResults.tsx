import { SearchResultsNavBar } from "."
import { Course } from "../constants"
import CourseResult from "./CourseResult"

export const SearchResults = (props: {searched: Course[], setSearched: Function, results: boolean, setResults: Function}) => (
    <section className={`h-full flex flex-col ${props.results ? "block" : "hidden"}`}>
        <SearchResultsNavBar
            results={props.results}
            setResults={props.setResults}
            setSearched={props.setSearched}
        />
        <div className="h-1 overflow-y-scroll flex-grow">
            {props.searched.map((course) => (
                <CourseResult key={`${course.department} ${course.number}`} course={course}/>
            ))}
        </div>

    </section>
)