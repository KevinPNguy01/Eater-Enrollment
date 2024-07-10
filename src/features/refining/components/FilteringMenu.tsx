import { statusColors, typeColors } from "../../../constants/TextColors";
import { ColoredText } from "../../../components/ColoredText";
import { FilterOptions } from "../types/options";

export function FilterMenu(props: {optionsState: [FilterOptions, (options: FilterOptions) => void], defaultOptions: FilterOptions}) {
    const [options, setOptions] = props.optionsState;
    const {defaultOptions} = props;
    const updateOptions = () => setOptions(Object.assign({}, options));
    const {sectionTypes, statusTypes, dayTypes, restrictionTypes} = options;
    const {
        sectionTypes: defaultSections, 
        statusTypes: defaultStatuses, 
        dayTypes: defaultDays, 
        restrictionTypes: defaultRestrictions
    } = defaultOptions;
    return (
        <div className="bg-secondary border top-full left-0 my-1 p-4 border-quaternary absolute z-10 text-base text-left">
            <p className="text-xl whitespace-pre border-b border-quaternary mb-2">{"Search Filters"}</p>
            <div className="grid grid-flow-col auto-cols-auto gap-4">
                <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                    <legend>Section Type</legend>
                    <OptionList className="grid grid-cols-2" options={sectionTypes} defaultOptions={defaultSections} updateOptions={updateOptions} colorRules={typeColors}/>
                    <SelectDeselectAll options={sectionTypes} defaultOptions={defaultSections} updateOptions={updateOptions}/>
                </fieldset>
                <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                    <legend>Status</legend>
                    <OptionList options={statusTypes} defaultOptions={defaultStatuses} updateOptions={updateOptions} colorRules={statusColors}/>
                    <SelectDeselectAll options={statusTypes} defaultOptions={defaultStatuses} updateOptions={updateOptions}/>
                </fieldset>
                <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                    <legend>Days</legend>
                    <OptionList options={dayTypes} defaultOptions={defaultDays} updateOptions={updateOptions}/>
                    <SelectDeselectAll options={dayTypes} defaultOptions={defaultDays} updateOptions={updateOptions}/>
                </fieldset>
                <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                    <legend>Restrictions</legend>
                    <OptionList options={restrictionTypes} defaultOptions={defaultRestrictions} updateOptions={updateOptions}/>
                    <SelectDeselectAll options={restrictionTypes} defaultOptions={defaultRestrictions} updateOptions={updateOptions}/>
                </fieldset>
            </div>
        </div>
    )
}

/**
 * Component contain buttons to select/deselect all options.
 * @param options The options to modify.
 * @param defaultOptions The options to select/deselect.
 * @param updateOptions A function to update the options after modifying.
 */
function SelectDeselectAll(props: {options: Set<string>, defaultOptions: Set<string>, updateOptions: () => void}) {
    const {options, defaultOptions, updateOptions} = props;

    // Event handler to either select or deselect all the options when button is clicked.
    const clickHandler = (select: boolean) => () => {
        defaultOptions.forEach(option => {
            for (const checkbox of document.getElementsByClassName(`checkbox-${option}`)) {
                (checkbox as HTMLInputElement).checked = select;
            }
            select ? options.add(option) : options.delete(option);
            updateOptions();
        });
    }
    const buttonStyle = "border border-quaternary rounded hover:bg-tertiary m-1 p-1 text-sm";

    return (
        <div className="grid grid-cols-2 w-fit">
            <button className={buttonStyle} onClick={clickHandler(true)}>All</button>
            <button className={buttonStyle} onClick={clickHandler(false)}>None</button>
        </div>
    )
}

/**
 * @param options The options to modify.
 * @param defaultOptions The options to render the checkboxes and labels for.
 * @param updateOptions A function to update the options after modifying.
 * @returns An array of components containing checkbox/label pairs for the given default options.
 */
function OptionList(props: {className?: string, options: Set<string>, defaultOptions: Set<string>, updateOptions: () => void, colorRules?: Map<string, string>}) {
    const {className, options, defaultOptions, updateOptions, colorRules} = props;

    return (
        <div className={className}>
            {Array.from(defaultOptions).map(option => (
                <div className="flex">
                    <input type="checkbox" id={option} name={option}
                        defaultChecked={options.has(option)} 
                        className={`text-left my-1 checkbox-${option}`} 
                        onChange={e => {
                            e.target.checked ? options.add(e.target.name) : options.delete(e.target.name);
                            updateOptions();
                        }}
                    />
                    <ColoredText className="ml-1 font-bold" text={option} colorRules={colorRules}/>
                </div>
            ))}
        </div>
    );
}