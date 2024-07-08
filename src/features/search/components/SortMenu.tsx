import { SortingOptions } from "../../../app/pages/SearchResults";

export function SortMenu(props: {sortingOptions: SortingOptions}) {
    const {sortBy, setSortBy, direction, setDirection, setSortWithin} = props.sortingOptions;
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
            <div className="flex border-t border-quaternary pt-2 mt-2">
                <input type="checkbox" className="mr-1" onChange={e => {
                    e.currentTarget.checked ? setSortWithin(true) : setSortWithin(false);
                }}/>
                Sort within courses
            </div>
        </div>
    )
}