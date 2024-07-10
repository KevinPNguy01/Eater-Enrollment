import { useState } from "react";
import { Query } from "../../../utils/PeterPortal";
import { getSuggestions, SearchSuggestion } from "../utils/FormHelpers";
import { QueryBubble } from "./QueryBubble";
import { SearchList } from "./SearchList";

export function SearchBox(props: {queriesState: [Query[], (queries: Query[]) => void], defaultQuery: Query, submit: () => void}) {
    const {defaultQuery, submit} = props;
    const [queries, setQueries] = props.queriesState;
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([] as SearchSuggestion[])

    // Functions for manipulating the search queries.
    const addQuery = (query: Query) => {
        setQueries([...queries, {...defaultQuery, ...query}]);
        setInput("");
        setSuggestions([]);
    }
    const deleteQuery = (index: number) => {
        setQueries([...queries.slice(0, index), ...queries.slice(index+1)]);
    }

    return (
        <div className="relative flex border-b">
            {queries.map((query, index) => <QueryBubble key={index} query={query} removeFunction={() => deleteQuery(index)}/>)}
            {/** Generate search suggestions as the user types. */}
            <input 
                className="m-1 w-full border-0"
                placeholder="Search"
                value={input}
                onChange={e => {setInput(e.target.value); setSuggestions(getSuggestions(e.target.value).slice(0, 20))}}
                onKeyDown={e => {if (e.key === "Enter" && !input.length) submit()}}
            />
            <SearchList suggestions={suggestions} appendFunction={addQuery}/>
        </div>
    )   
}