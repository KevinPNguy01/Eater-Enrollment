import { useState, createContext } from "react";
import { navLinks } from "../../constants/Links";
import { Course } from "../../constants/Types";
import { SearchSuggestion } from "../../utils/FormHelpers";
import { ScheduleOptions } from "../../utils/PeterPortal";
import { AddedTab } from "./AddedTab";
import { SearchTab } from "./SearchTab";

export const Courses = () => {
    // React State Hook for keeping track of which tab is selected.
    const [activeTab, setActiveTab] = useState("search");

    // React State Hook for determining whether to show course search results or not.
    const [searchResultsVisibility, setSearchResultsVisibility] = useState(false);

    //React State Hook for keeping track of course search results.
    const [searchResults, setSearchResults] = useState(new Array<Course>());

    // React State Hook for keeping track of a list of course suggestions.
    const [courseSuggestions, setCourseSuggestions] = useState([] as SearchSuggestion[]);

    // React State Hook used as the text label in the search box.
    const [courseInput, setCourseInput] = useState("");

    // React State hook used for storing the search queries to request.
    const [queries, setQueries] = useState([] as ScheduleOptions[])

    // React State hook for rerendering this component. 
    const [, setUpdateCounter] = useState(0);

    // React State hooks for keeping track of term and year.
    const [term, setTerm] = useState("Fall");
    const [year, setYear] = useState("2024");
    
    return (
        <SearchContext.Provider value = {{
            activeTab, setActiveTab,
            searchResultsVisibility, setSearchResultsVisibility,
            searchResults, setSearchResults,
            courseSuggestions, setCourseSuggestions,
            courseInput, setCourseInput,
            queries, setQueries,
            term, setTerm,
            year, setYear,
            callBack: () => setUpdateCounter(a => a+1)
        }}>
            <div className="relative m-1 flex flex-col h-full">
                <CoursesNavBar activeTab={activeTab} setActiveTab={setActiveTab}/>
                <SearchTab activeTab={activeTab}/>
                <AddedTab activeTab={activeTab}/>
            </div>
        </SearchContext.Provider>
    )
}

type SearchContent = {
    activeTab: string,
    setActiveTab: (_: string) => void;
    searchResultsVisibility: boolean;
    setSearchResultsVisibility: (a: boolean) => void;
    searchResults: Course[]; 
    setSearchResults: (a: Course[]) => void;
    courseSuggestions: SearchSuggestion[];
    setCourseSuggestions: (list: SearchSuggestion[]) => void;
    courseInput: string;
    setCourseInput: (a: string) => void;
    queries: ScheduleOptions[];
    setQueries: (a: ScheduleOptions[]) => void;
    term: string;
    setTerm: (_: string) => void;
    year: string;
    setYear: (_: string) => void;
    callBack: () => void;
}

const CoursesNavBar = (props: {activeTab: string, setActiveTab: (_: string) => void}) => {
    return(
        <nav className="bg-tertiary h-12 grid grid-cols-3 mb-2">
            {navLinks.slice(1).map((nav, index) => (
                <CoursesNavButton 
                    key={index} 
                    id={nav.id} 
                    title={nav.title}
                    activeTab={props.activeTab}
                    setActiveTab={props.setActiveTab}
                />
            ))}
        </nav>
    )
}

interface Props {
    id: string;
    title: string;
    activeTab: string;
    setActiveTab: (a: string) => void;
}

const CoursesNavButton = (props: Props) => {
    return (
        <button 
            className={`courses-nav-button h-full ${props.activeTab === props.id ? "active" : "inactive"}`} 
            onClick={() => props.setActiveTab(props.id)}
        >
            {props.title}
        </button>
    )
}

export const SearchContext = createContext<SearchContent>({} as SearchContent);