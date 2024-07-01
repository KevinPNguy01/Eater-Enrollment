import { createContext, useState } from "react";
import { SearchForms, SearchResults } from "..";
import { Course } from "../../constants/types";
import { ScheduleOptions } from "../../helpers/PeterPortal";

export function SearchTab(props: { activeTab: string }) {
    // React State Hook for determining whether to show course search results or not.
    const [searchResultsVisibility, setSearchResultsVisibility] = useState(false);

    //React State Hook for keeping track of course search results.
    const [searchResults, setSearchResults] = useState(new Array<Course>());

    // React State Hook for keeping track of a list of course suggestions.
    const [courseSuggestions, setCourseSuggestions] = useState(new Array<{department: string, number: string, title: string}>());

    // React State Hook used as the text label in the search box.
    const [courseInput, setCourseInput] = useState("");

    // React State hook used for storing the search queries to request.
    const [queries, setQueries] = useState([] as ScheduleOptions[])

    // React State hook for rerendering this component. 
    const [, setUpdateCounter] = useState(0);

    return (
        <SearchContext.Provider value = {{
            searchResultsVisibility, setSearchResultsVisibility,
            searchResults, setSearchResults,
            courseSuggestions, setCourseSuggestions,
            courseInput, setCourseInput,
            queries, setQueries
        }}>
            <div className={`h-1 flex flex-col flex-grow ${props.activeTab === "search" ? "block" : "hidden"}`}>
                <SearchForms callBack={() => setUpdateCounter(a => a+1)}/>        
                <SearchResults/>
            </div>
        </SearchContext.Provider>
    )
}

type SearchContent = {
    searchResultsVisibility: boolean;
    setSearchResultsVisibility: (a: boolean) => void;
    searchResults: Course[]; 
    setSearchResults: (a: Course[]) => void;
    courseSuggestions: {department: string, number: string, title: string}[];
    setCourseSuggestions: (list: {department: string, number: string, title: string}[]) => void;
    courseInput: string;
    setCourseInput: (a: string) => void;
    queries: ScheduleOptions[];
    setQueries: (a: ScheduleOptions[]) => void;
}

export const SearchContext = createContext<SearchContent>({} as SearchContent);