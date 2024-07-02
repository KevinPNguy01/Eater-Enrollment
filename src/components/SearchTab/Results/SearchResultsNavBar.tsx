import { useContext } from "react";
import { SearchContext } from "../..";
import { requestSchedule } from "../../../helpers/PeterPortal";

export function SearchResultsNavBar(props: {callBack: () => void}) {
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
        </nav>
    )
} 