import { useContext } from "react";
import { SearchContext } from "./CoursesPane";
import { SearchForms } from "./SearchForms";
import { SearchResults } from "./SearchResults";

export function SearchTab(props: { activeTab: string }) {
    const {searchResultsVisibility} = useContext(SearchContext);

    return (
        <div className={`h-1 flex flex-col flex-grow ${props.activeTab === "search" ? "block" : "hidden"}`}>
            {!searchResultsVisibility ? <SearchForms/> : <SearchResults/>}        
        </div>
    )
}