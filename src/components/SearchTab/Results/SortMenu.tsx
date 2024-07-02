import { SortingOptions } from "./SearchResults";

export function SortMenu(props: {sortingOptions: SortingOptions}) {
    const {sortBy, setSortBy, direction, setDirection} = props.sortingOptions;
    const options = ["Name", "GPA", "RMP"]
    return (
        <div className="bg-secondary border top-full left-0 my-1 p-4 border-quaternary absolute z-10 text-base text-left">
            <p className="border-b border-quaternary whitespace-pre">{"Sort By                              "}</p>
            <div className="grid grid-cols-2">
                <div className="flex flex-col">
                    {options.map(option => {
                        return (
                            <button className={`text-left my-1 ${option === sortBy ? "font-bold" : ""}`} onClick={() =>setSortBy(option)}>
                                {option}
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-col">
                    <button className={`text-left my-1 ${direction === "Ascending" ? "font-bold" : ""}`} onClick={() => setDirection("Ascending")}>Ascending</button>
                    <button className={`text-left my-1 ${direction === "Descending" ? "font-bold" : ""}`} onClick={() => setDirection("Descending")}>Descending</button>
                </div>
            </div>
        </div>
    )
}