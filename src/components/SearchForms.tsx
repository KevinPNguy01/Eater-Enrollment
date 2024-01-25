import { FormEvent, useState } from "react";
import courses from "../assets/allCourses.json"
import { DropDown, SearchList } from ".";
import { Course, CourseOffering } from "../constants";


async function getCourse(year: number, term: string, department: string, number: string) {
    const sectionSelection = `section{code type number}`;
    const instructorSelection = `instructors{shortened_name}`
    const meetingsSelection = `meetings{time days building}`
    const offeringsConstructor = `offerings(year:${year}, quarter:"${term}")`;
    const offeringsSelection = `{restrictions status ${meetingsSelection} ${instructorSelection} num_total_enrolled max_capacity ${sectionSelection}}`;
    const offeringsQuery = `${offeringsConstructor} ${offeringsSelection}`;
    const courseConstructor = `course(id:"${(department+number).replace(" ", "")}")`;
    const courseSelection = `{department number title ${offeringsQuery}}`;
    const query: string = `query { ${courseConstructor} ${courseSelection} }`;
    console.log(query);
    const response = await fetch("https://api.peterportal.org/graphql",
        {
            method: 'POST',
            headers: {
            'content-type': 'application/json',
            },
            body: JSON.stringify({'query': query}),
        }
    );
    const {data, errors} = await response.json();
    return data.course;
}

const SearchForms = (props: {searched: Course[], setSearched: Function, results: boolean, setResults: Function}) => {
    const [courseList, setCourseList] = useState(courses.data.allCourses.slice(0,0));
    const [courseInput, setCourseInput] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (courseList.length == 0) return;
        setCourseInput("");
        props.setResults(!props.results);
        const target = event.target as typeof event.target & {
            term: {value : string};
            year: {value : string};
            course: {value: string;}
        };
        const year: number = parseInt(target.year.value);
        const term: string = target.term.value;
        const department: string = target.course.value.split("-")[0];
        const number: string = target.course.value.split("-")[1];
        const course: Course = await getCourse(year, term, department, number);
        props.setSearched([course]);
        console.log(course);
    }

    const autoSuggest = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchStr = e.target.value;
        const searchStrList = searchStr.toLowerCase().split(" ");
        let regExpStr = "";
        for (let word of searchStrList) {
            for (let i = 0; i < word.length; ++i) {
                const c = word.charAt(i);
                if (i==0) {
                    regExpStr += ".* ";
                }
                regExpStr += c;
                if ('0' > c || c > '9') {
                    regExpStr += ".?";
                }
            }
        }
        let regExp = new RegExp(regExpStr);
        setCourseList(courses.data.allCourses.slice(0,0));
        if (searchStr.length > 2) setCourseList(courses.data.allCourses.filter(
            course => (regExp.test(` ${course.department} ${course.number}: ${course.title}`.toLowerCase())))
        );

    }

    return (
        <form autoComplete="off" id="searchForm" className={`flex flex-col h-1 grow ${!props.results ? "block" : "hidden"}`} onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
                <DropDown
                    label = "Term"
                    name = "term"
                    options={[
                        "Fall", "Winter", "Spring", 
                        "Summer Session 1", "Summer Session 2", "10-wk Summer"
                    ]}
                    selected="Winter"
                />
                <DropDown
                    label = "Year"
                    name = "year"
                    options={Array.from({ length: new Date().getFullYear() - 2015 + 2}, (_, index) => new Date().getFullYear()+1 - index)}
                    selected={2024}
                />
            </div>
            <br></br>
            <input 
                className="mx-1"
                name="course"
                placeholder="Search"
                value={courseInput}
                id="searchBox"
                onChange={(e) => setCourseInput(e.target.value)}
                onInput={autoSuggest}
            />
            <SearchList 
                list={courseList}
                results={props.results}
                setResults={props.setResults}
                searched={props.searched}
                setSearched={props.setSearched}
                setCourseInput={setCourseInput}
                autoSuggest={autoSuggest}
            />
        </form>
    )
}

export default SearchForms