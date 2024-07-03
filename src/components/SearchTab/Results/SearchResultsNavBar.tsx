import { useContext, useState } from "react";
import { SearchContext } from "../..";
import { requestSchedule } from "../../../helpers/PeterPortal";
import { SortMenu } from "./SortMenu";
import { FilteringOptions, SortingOptions } from "./SearchResults";
import { FilterMenu } from "./FilteringMenu";

export function SearchResultsNavBar(props: {sortingOptions: SortingOptions, filteringOptions: FilteringOptions, callBack: () => void}) {
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [filterMenuVisible, SetFilterMenuVisible] = useState(false);
    const { setSearchResultsVisibility, setSearchResults, setQueries, queries} = useContext(SearchContext);
    return (
        <nav className="flex bg-secondary border border-quaternary p-1 mb-4 rounded text-2xl whitespace-pre text-center items-center">
            <button className="mr-4 hover:bg-tertiary rounded-full w-fit aspect-square" onClick={() => {
                setSearchResultsVisibility(false);
                setSearchResults([]);
                setQueries([]);
            }}>
                {" ← "}
            </button>
            <button className="mr-4 hover:bg-tertiary rounded-full w-fit aspect-square" onClick={async () => {
                setSearchResults([]);
                const courses = await requestSchedule(queries, props.callBack);
                setSearchResults(courses);
            }}>
                {" ↻ "}
            </button>
            <div className="relative">
                <button className="mr-4 hover:bg-tertiary rounded-full w-fit aspect-square" onClick={() => {setSortMenuVisible(!sortMenuVisible)}}>
                    {" ⇅ "}
                </button>
                {sortMenuVisible ? <SortMenu sortingOptions={props.sortingOptions}/> : null}
            </div>
            <div className="relative">
                <button className="mr-4 hover:bg-tertiary rounded-full w-fit aspect-square" onClick={() => {SetFilterMenuVisible(!filterMenuVisible)}}>
                    {" ⚙ "}
                </button>
                {filterMenuVisible ? <FilterMenu filteringOptions={props.filteringOptions}/> : null}
            </div>
        </nav>
    )
} 