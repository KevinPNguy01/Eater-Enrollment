import { useState, createContext } from "react";
import { navLinks } from "../../constants/Links";
import { Course } from "../../constants/Types";
import { requestSchedule, Query } from "../../utils/PeterPortal";
import { AddedTab } from "./AddedTab";
import { SearchForms } from "./SearchForms";
import { SearchResults } from "./SearchResults";

export const SearchContext = createContext((department: string, number: string) => {department; number;});

export function Courses() {
    const [activeTab, setActiveTab] = useState("search");
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState(new Array<Course>());

    // React State hooks used for storing search queries.
    const queriesState = useState([] as Query[])
    const [queries, setQueries] = queriesState;
    const defaultQueryState = useState({quarter: "Fall", year: "2024"} as Query);
    const [defaultQuery] = defaultQueryState;

    // React State hook for rerendering this component. 
    const [, setUpdateCounter] = useState(0);

    // Functions related to searching.
    const submitSearch = async (searchQueries = queries) => {
        // If there are queries, search for them.
        if (!searchQueries.length) return;
        setShowResults(true);
        setSearchResults([]);
        setActiveTab("search");
        const courses = await requestSchedule(searchQueries, () => setUpdateCounter(a => a+1));
        setSearchResults(courses);
    }
    const resetSearch = () => {
        setShowResults(false);
        setQueries([]);
    }
    const searchCourse = (department: string, number: string) => {
        const newQueries = [{...defaultQuery, department, number}];
        setQueries(newQueries);
        submitSearch(newQueries);
    }
    
    return (
        <div className="relative m-1 flex flex-col h-full">
            <nav className="bg-tertiary h-12 grid grid-cols-3 mb-2">
                {navLinks.slice(1).map(({id, title}) => (
                    <button key={id} className={`h-full ${id === activeTab ? "border-b-4 border-primary" : "text-neutral-300"}`} onClick={() => setActiveTab(id)}>
                        {title}
                    </button>
                    
                ))}
            </nav>
            <SearchContext.Provider value={searchCourse}>
                {(function getActiveTab() {
                    // Return page components depending on the active tab.
                    switch(activeTab) {
                        case "search": return showResults ? (
                            <SearchResults courses={searchResults} submitSearch={submitSearch} resetSearch={resetSearch}/>
                        ) : (
                            <SearchForms queriesState={queriesState} defaultQueryState={defaultQueryState} submit={submitSearch}/>
                        );
                        case "added": return <AddedTab/>;
                        default: return null;
                    }
                })()}
            </SearchContext.Provider>
        </div>
    )
}