import { useContext } from "react";
import { SearchContext } from "../..";

export function SearchResultsNavBar() {
    const { setSearchResultsVisibility, setSearchResults} = useContext(SearchContext);
    return (
        <nav>
            <button onClick={() => {
                setSearchResultsVisibility(false);
                setSearchResults([])
            }}>
                Back
            </button>
        </nav>
    )
} 