import { useContext, useState } from "react";
import { Query } from "../../../utils/PeterPortal";
import { getSuggestions, SearchSuggestion } from "../utils/FormHelpers";
import { QueryBubble } from "./QueryBubble";
import { SearchList } from "./SearchList";
import { SearchContext } from "../../../app/pages/CoursesPane";

export function SearchBox(props: {queriesState: [Query[], (queries: Query[]) => void], defaultQuery: Query, submit: () => void}) {
    const search = useContext(SearchContext);
    const {defaultQuery} = props;
    const [queries, setQueries] = props.queriesState;
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([] as SearchSuggestion[])

    // Functions for manipulating the search queries.
    const addQuery = (query: Query) => {
        setQueries([...queries, {...defaultQuery, ...query}]);
        setInput("");
        setSuggestions([]);
    };
    const deleteQuery = (index: number) => {
        setQueries([...queries.slice(0, index), ...queries.slice(index+1)]);
    };

    const keyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        // If the user presses enter
        if (suggestions.length) {           // Add the first search suggestion.
            addQuery(suggestions[0].value);
        } else if (input.length == 0) {     // Submit search if the box is empty.
            search(queries);
        }
    };

    return (
        <div className="relative flex border-b">
            {queries.map((query, index) => <QueryBubble key={index} query={query} removeFunction={() => deleteQuery(index)}/>)}
            {/** Generate search suggestions as the user types. */}
            <input 
                className="m-1 w-full border-0"
                placeholder="Search"
                value={input}
                onChange={e => {setInput(e.target.value); setSuggestions(getSuggestions(e.target.value))}}
                onKeyDown={keyHandler}
            />
            <button onClick={() => search(queries)}>🔍</button>
            <SearchList suggestions={suggestions.slice(0, 15)} appendFunction={addQuery}/>
        </div>
    )   
}