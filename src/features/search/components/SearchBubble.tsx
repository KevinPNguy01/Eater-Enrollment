import { useEffect, useRef, useState } from "react";
import { SearchSuggestion, getSuggestions } from "../utils/FormHelpers";
import { QueryBubble } from "./QueryBubble";
import { Query } from "../../../utils/PeterPortal";
import { Tooltip } from "../../../components/Tooltip";

const searchIcon = (
    <svg focusable="false"xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="#bbb" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
);
const multiSearchIcon = (
    <svg focusable="false"xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="#bbb" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        <path stroke="#bbb" strokeWidth="2" transform="translate(12, -3) scale(0.5)" d="M6 12h12M12 6v12"/>
    </svg>
);

export function SearchBubble(props: {
    inputState: [string, (_: string) => void],
    focusState: [boolean, (_: boolean) => void], 
    multiState: [boolean, (_: boolean) => void], 
    queriesState: [Query[], (_: Query[]) => void],
    suggestionsState: [SearchSuggestion[], (_: SearchSuggestion[]) => void],
    addQuery: (query: Query) => void,
    deleteQuery: (index: number) => void,
    submitQueries: (query?: Query[]) => void}
) {
    const [suggestions, setSuggestions] = props.suggestionsState;
    const [queries, setQueries] = props.queriesState;
    const [multi, setMulti] = props.multiState;
    const [focus, setFocus] = props.focusState;
    const [input, setInput] = props.inputState;
    const [scrollFade, setScrollFade] = useState(false);
    const {addQuery, deleteQuery, submitQueries} = props;
    const scrollRef = useRef<HTMLDivElement>(null);

    const keyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        // If the user presses enter
        if (suggestions.length) {           // Add the first search suggestion and clear the search box.
            addQuery(suggestions[0].value);
            setInput("");
        } else if (input.length === 0) {     // Submit search if the box is empty.
            submitQueries();
        }
    };

    const toggleMultiSearch = () => {
        const isMulti = !multi;
        setMulti(isMulti);
        setQueries([]);
        // If state is now single-search, there are queries, and the user isn't typing
        if (!isMulti && queries.length && !input.length) {
            const query = queries[queries.length-1]
            const {ge, department, number} = query;
            const text = ge ? ge : department + (number ? ` ${number}` : "");
            setInput(text);
        // If the state is now multi-search, clear the text box.
        } else if (isMulti && !input.length) {
            setInput("");
        }
    };

    // Update scroll position when the number of queries changes, or if toggling multi-search.
    useEffect(() => {
        const {current} = scrollRef;
        if (current) {
            current.scrollLeft = current.scrollWidth;
            setScrollFade(current.scrollWidth !== current.clientWidth);
        }
    }, [queries, multi]);

    return (
        <div className={`flex w-full px-2 items-center border-quaternary ${suggestions.length && focus ? "border-b" : ""}`}>
            {/** Magnifying glass icon to toggle mutli-search. */}
            <div className="relative group hover:cursor-pointer" onClick={toggleMultiSearch}>
                {multi ? multiSearchIcon : searchIcon}
                <Tooltip className="select-none left-1/2 -translate-x-1/2 text-nowrap text-xs mt-1 bg-tertiary border border-neutral-500 p-1.5 text-neutral-300 hidden group-hover:block" text="Toggle multi-search"/>
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
                {multi ? queries.map((query, index) => <QueryBubble key={index} query={query} removeFunction={() => deleteQuery(index)}/>) : null}
    
                {/** Generate search suggestions as the user types. */}
                <input 
                    className="m-1 h-1/2 min-w-[75%] flex-grow border-0"
                    placeholder="Search"
                    type="text"
                    value={input}
                    onChange={({target}) => {
                        setInput(target.value); 
                        setSuggestions(getSuggestions(target.value));
                    }}
                    onKeyDown={keyHandler}
                    onFocus={() => {
                        setFocus(true);
                        setSuggestions(getSuggestions(input));
                    }}
                    onBlur={() => setFocus(false)}
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
}