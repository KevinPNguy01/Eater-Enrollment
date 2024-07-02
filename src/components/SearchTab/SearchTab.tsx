import { createContext, useState } from "react";
import { SearchForms, SearchResults } from "..";
import { Course } from "../../constants/types";
import { ScheduleOptions } from "../../helpers/PeterPortal";
import { SearchSuggestion } from "../../helpers/FormHelpers";

export function SearchTab(props: { activeTab: string }) {
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
            searchResultsVisibility, setSearchResultsVisibility,
            searchResults, setSearchResults,
            courseSuggestions, setCourseSuggestions,
            courseInput, setCourseInput,
            queries, setQueries,
            term, setTerm,
            year, setYear
        }}>
            <div className={`h-1 flex flex-col flex-grow ${props.activeTab === "search" ? "block" : "hidden"}`}>
                {!searchResultsVisibility ? <SearchForms callBack={() => setUpdateCounter(a => a+1)}/> : <SearchResults/>}        
            </div>
        </SearchContext.Provider>
    )
}

type SearchContent = {
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
}

export const SearchContext = createContext<SearchContent>({} as SearchContent);