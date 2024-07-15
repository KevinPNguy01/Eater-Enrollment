import { useState, createContext } from "react";
import { navLinks } from "../../constants/Links";
import { Course } from "../../constants/Types";
import { requestSchedule, Query } from "../../utils/PeterPortal";
import { AddedTab } from "./AddedTab";
import { SearchForms } from "./SearchForms";
import { SearchResults } from "./SearchResults";
import { MapTab } from "./MapTab";

export type SearchFunctions = {
    submitSearch: () => void
    resetSearch: () => void
    backSearch: () => void
    forwardSearch: () => void
    refreshSearch: () => void
}

const SearchContext = createContext((queries: Partial<Query>[]) => {queries});

function CoursesPane() {
    const [activeTab, setActiveTab] = useState("search");
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState(new Array<Course>());

    // React State hooks used for storing search queries.
    const queriesState = useState([] as Query[])
    const [lastQueries, setLastQueries] = useState([] as Query[]);
    const [queries, setQueries] = queriesState;
    const defaultQueryState = useState({quarter: "Fall", year: "2024"} as Query);
    const [defaultQuery] = defaultQueryState;
    const [backQueries, setBackQueries] = useState([] as Query[][]);
    const [forwardQueries, setForwardQueries] = useState([] as Query[][]);

    // React State hook for rerendering this component. 
    const [, setUpdateCounter] = useState(0);

    // Functions related to searching.
    const submitSearch = async (searchQueries = queries) => {
        // If there are queries, search for them.
        if (!searchQueries.length) return;
        setLastQueries(searchQueries);  // Store last search.
        setActiveTab("search");         // Switch to search tab.
        setSearchResults([]);           // Clear last results.
        setShowResults(true);           // Show results component.
        const courses = await requestSchedule(searchQueries, () => setUpdateCounter(a => a+1));
        setSearchResults(courses);      // Update results.
    }
    const resetSearch = () => {
        setShowResults(false);  // Hide results component.
        setLastQueries([]);     // Clear last search.
        setQueries([]);         // Clear current search.
        setBackQueries([]);     // Clear back searches.
        setForwardQueries([]);  // Clear forward searches
    }
    const backSearch = () => {
        if (!backQueries.length) return;
        // Store last search if exists.
        if (lastQueries.length)
            setForwardQueries([...forwardQueries, lastQueries]);
        // Search for most recent back query.
        const newQueries = backQueries.pop()!;
        setQueries(newQueries);
        submitSearch(newQueries);
    }
    const forwardSearch = () => {
        if (!forwardQueries.length) return;
        // Store last search if exists.
        if (lastQueries.length)
            setBackQueries([...backQueries, lastQueries]);
        // Search for most recent forward query.
        const newQueries = forwardQueries.pop()!;
        setQueries(newQueries);
        submitSearch(newQueries);
    }
    const refreshSearch = () => {
        // Re-search the last search.
        submitSearch(lastQueries);
        setQueries(lastQueries);
    }
    const search = (searchQueries: Partial<Query>[]) => {
        // Store last search if exists.
        if (lastQueries.length) 
            setBackQueries([...backQueries, lastQueries]);
        // Search for new queries.
        const newQueries = searchQueries.map(query => ({...defaultQuery, ...query}));
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
            <SearchContext.Provider value={search}>
                {(function getActiveTab() {
                    // Return page components depending on the active tab.
                    switch(activeTab) {
                        case "search": return showResults ? (
                            <SearchResults 
                                courses={searchResults} 
                                queriesState={queriesState} 
                                defaultQuery={defaultQuery} 
                                searchFunctions={{submitSearch, resetSearch, backSearch, forwardSearch, refreshSearch}}
                            />
                        ) : (
                            <SearchForms queriesState={queriesState} defaultQueryState={defaultQueryState} submit={submitSearch}/>
                        );
                        case "added": return <AddedTab/>;
                        case "map": return <MapTab/>;
                        default: return null;
                    }
                })()}
            </SearchContext.Provider>
        </div>
    )
}

export {CoursesPane, SearchContext};