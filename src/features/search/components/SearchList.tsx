import { SearchSuggestion } from "../utils/FormHelpers";
import { Query } from "../../../utils/PeterPortal";

/**
 * Displays a list of clickable and selectable search suggestions.
 * @param suggestions The array of search suggestions to display.
 * @param appendFunction Called when a search suggestion is selected to add a query.
 */
export function SearchList(props: {suggestions: SearchSuggestion[], appendFunction: (query: Query) => void}) {
    const {suggestions, appendFunction} = props;
    const buttonStyle = "p-2 bg-tertiary text-left border-b border-quaternary hover:bg-quaternary";

    return (
        <div className="absolute left-0 top-full grid rounded w-full max-h-content z-10">
            {suggestions.map(({text, value}) => (
                <button key={text} className={buttonStyle} type="submit" onClick={() => appendFunction(value)}>{text}</button>
            ))}
        </div>
    );
}