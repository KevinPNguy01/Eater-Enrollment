import { useContext } from "react";
import { SearchContext } from "../..";

export function SearchList() {
    const { courseSuggestions, queries, setQueries, term, year } = useContext(SearchContext);
    return (
        <div className="grid rounded-xl max-h-full mx-1 my-4 overflow-y-scroll">
            {courseSuggestions.map(({text, value}) => (
                <button 
                    key={text} 
                    className="search-course-option p-2"
                    type="submit"
                    onClick={() => {
                        const query = Object.assign({
                            quarter: term,
                            year: year,
                            department: "",
                            number: "",
                        }, value)
                        setQueries(queries.concat(query));
                    }}
                >
                    {text}
                </button>
            ))}
        </div>
    )
}