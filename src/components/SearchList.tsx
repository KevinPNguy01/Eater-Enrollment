import { Course } from "../constants";


const SearchList = (props: {searched: Course[], setSearched: Function, autoSuggest: Function, setCourseInput: Function, results: boolean, setResults: Function, list: {department: string, number: string, title: string}[]}) => {
  return (
    <section className="grid rounded-xl max-h-full mx-1 my-4 overflow-y-scroll">
        {props.list.map((course) => (
            <button 
                key={`${course.department}${course.number}`} 
                className="search-course-option p-2"
                onClick={() => {
                    let courseName: string = `${course.department} ${course.number}: ${course.title}`
                    props.setCourseInput(courseName);
                    props.autoSuggest({ target: { value: "" } });
                    (document.getElementById("searchBox") as HTMLInputElement).value = `${course.department}-${course.number}`;
                    (document.getElementById("searchForm") as HTMLFormElement).dispatchEvent(new Event("submit", {cancelable: true, bubbles: true}));
                }}
            >
                {`${course.department} ${course.number}: ${course.title}`}
            </button>
        ))}
    </section>
  )
}

export default SearchList