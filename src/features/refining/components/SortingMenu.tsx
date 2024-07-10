import { SortBy, SortDirection, SortOptions } from "../types/options";

export function SortingMenu(props: {optionsState: [SortOptions, (options: SortOptions) => void]}) {
    const [options, setOptions] = props.optionsState;
    const {sortBy, direction, sortWithin} = options;

    // Event handlers that for the inputs and buttons.
    const updateOptions = () => setOptions(Object.assign({}, options));
    const setSortBy = (option: SortBy) => () => {options.sortBy = option; updateOptions()};
    const setDirection = (option: SortDirection) => () => {options.direction = option; updateOptions()};
    const setSortWithin = (option: boolean) => {options.sortWithin = option; updateOptions()};

    return (
        <div className="bg-secondary border top-full left-0 my-1 p-4 border-quaternary absolute z-10 text-base text-left">
            <p className="border-b border-quaternary whitespace-pre">{"Sort By"}</p>
            <div className="grid grid-cols-2 *:flex *:flex-col *:*:text-left *:*:my-1">
                <div>
                    {Object.values(SortBy).map(option => 
                        <button className={option === sortBy ? "font-bold" : ""} onClick={setSortBy(option)}>{option}</button>
                    )}
                </div>
                <div>
                    {Object.values(SortDirection).map(option => 
                        <button className={option === direction ? "font-bold" : ""} onClick={setDirection(option)}>{option}</button>
                    )}
                </div>
            </div>
            <div className="flex border-t border-quaternary pt-2 mt-2">
                <input type="checkbox" className="mr-1" defaultChecked={sortWithin} onChange={e => setSortWithin(e.currentTarget.checked)}/>
                Sort within courses
            </div>
        </div>
    )
}