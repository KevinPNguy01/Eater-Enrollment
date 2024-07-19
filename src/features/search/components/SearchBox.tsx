import { useContext, useEffect, useRef, useState } from "react";
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

    const [scrollFade, setScrollFade] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
            setScrollFade(queries.length !== 0);
        }
    }, [queries]);

    const searchBubble = (
        <div className={`flex w-full px-4 items-center border-quaternary ${suggestions.length ? "border-b" : ""}`}>
            {/** Magnifying glass. */}
            <div className="mr-2">
                <svg focusable="false"xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#bbb" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
            </div>
            
            <div 
                className={`flex flex-grow gap-2 py-1 overflow-x-scroll hide-scroll`} 
                style={{maskImage: scrollFade ? "linear-gradient(to left, black 90%, transparent 100%)" : ""}}
                ref={scrollRef}
                onScroll={(e) => {
                    setScrollFade((queries.length !== 0) && (e.currentTarget.scrollLeft !== 0));
                }}
            >
                {/** Query bubbles */}
                {queries.map((query, index) => <QueryBubble key={index} query={query} removeFunction={() => deleteQuery(index)}/>)}

                {/** Generate search suggestions as the user types. */}
                <input 
                    className="m-1 h-1/2 min-w-[75%] flex-grow border-0"
                    placeholder="Search"
                    type="text"
                    value={input}
                    autoFocus
                    onChange={e => {setInput(e.target.value); setSuggestions(getSuggestions(e.target.value))}}
                    onKeyDown={keyHandler}
                />
            </div>
            

            {/** Show X button to clear search box if there is anything in it. */}
            {input || queries.length ? (
                <div>
                    <svg 
                        className="hover:cursor-pointer"
                        focusable="false" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width={24} 
                        height={24} 
                        onClick={() => {
                            setInput("");
                            setQueries([]);
                            setSuggestions([]);
                        }}
                    >
                        <path fill="#bbb" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </div>
            ) : null}
        </div>
    );

    return (
        <div className="relative w-full ">
            {searchBubble}
            <div className={`top-0 left-0 absolute flex flex-col w-full items-center bg-secondary border border-quaternary rounded-[20px] hover:shadow-[0px_0px_10px_#0008] z-20`}>
                {searchBubble}
                <SearchList suggestions={suggestions} appendFunction={addQuery}/>
            </div>
        </div>
    )   
}