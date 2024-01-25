import { useState } from "react";
import { SearchForms, SearchResults } from ".";
import { Course } from "../constants";

export const Search = (props: {active: string}) => {
    const [results, setResults] = useState(false);
    const [searched, setSearched] = useState(new Array<Course>());
    return (<section className={`h-1 flex flex-col flex-grow ${props.active === "search" ? "block" : "hidden"}`}>
            <SearchForms
                results={results}
                setResults={setResults}
                searched={searched}
                setSearched={setSearched}
            />        
            <SearchResults
                results={results}
                setResults={setResults}
                searched={searched}
                setSearched={setSearched}
            />
        </section>
    )
}
