import { statusColors, typeColors } from "../../../constants/TextColors";
import { ColoredText } from "../../../components/ColoredText";
import { FilterOptions } from "../types/options";
import MultiRangeSlider from "multi-range-slider-react";
import { useState } from "react";

export function FilterMenu(props: {optionsState: [FilterOptions, (options: FilterOptions) => void], defaultOptions: FilterOptions}) {
    const [options, setOptions] = props.optionsState;
    const {defaultOptions} = props;
    const updateOptions = () => setOptions({...options});
    const {sectionTypes, statusTypes, dayTypes, restrictionTypes, levelTypes} = options;
    const {
        sectionTypes: defaultSections, 
        statusTypes: defaultStatuses, 
        dayTypes: defaultDays, 
        restrictionTypes: defaultRestrictions,
        levelTypes: defaultLevels
    } = defaultOptions;
    const [minCaption, setMinCaption] = useState("");
    const [maxCaption, setMaxCaption] = useState("");
    return (
        <div className="bg-secondary border top-full left-0 my-1 p-4 border-quaternary absolute z-10 text-base text-left max-w-full">
            <p className="text-xl whitespace-pre border-b border-quaternary mb-2">{"Search Filters"}</p>
            <div className="flex flex-wrap *:flex-grow gap-4">
                <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                    <legend>
                        <SelectDeselectAll options={sectionTypes} defaultOptions={defaultSections} updateOptions={updateOptions}/>
                        Section Type
                    </legend>
                    <OptionList className="grid grid-cols-2" options={sectionTypes} defaultOptions={defaultSections} updateOptions={updateOptions} colorRules={typeColors}/>
                </fieldset>
                <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                    <legend>
                        <SelectDeselectAll options={statusTypes} defaultOptions={defaultStatuses} updateOptions={updateOptions}/>
                        Status
                    </legend>
                    <OptionList options={statusTypes} defaultOptions={defaultStatuses} updateOptions={updateOptions} colorRules={statusColors}/>
                </fieldset>
                <div className="grid">
                    <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                        <legend>
                            <SelectDeselectAll options={dayTypes} defaultOptions={defaultDays} updateOptions={updateOptions}/>
                            Days
                        </legend>
                        <OptionList className="flex gap-4" options={dayTypes} defaultOptions={defaultDays} updateOptions={updateOptions}/>
                    </fieldset>
                    <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                        <legend>Time</legend>
                        <MultiRangeSlider
                            className="!border-none !shadow-none"
                            labels={["8","10","12","2","4","6","8","10"]}
                            min={480} minValue={options.timeRange[0]} max={1320} maxValue={options.timeRange[1]} step={10} stepOnly={true}
                            minCaption={minCaption}
                            maxCaption={maxCaption}
                            onInput={e => {
                                const toTimeString = (totalMinutes: number) => {
                                    const hours = Math.floor(totalMinutes/60);
                                    const minutes = totalMinutes % 60;
                                    return `${(hours%12) || 12}:${minutes.toString().padEnd(2, "0")} ${hours >= 12 ? "pm" : "am"}`;
                                }
                                setMinCaption(toTimeString(e.minValue));
                                setMaxCaption(toTimeString(e.maxValue));
                            }}
                            onChange={e => setOptions({...options, timeRange: [e.minValue, e.maxValue]})}
                        />
                    </fieldset>
                </div>
                <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                    <legend>
                        <SelectDeselectAll options={levelTypes} defaultOptions={defaultLevels} updateOptions={updateOptions}/>
                        Course Level
                    </legend>
                    <OptionList options={levelTypes} defaultOptions={defaultLevels} updateOptions={updateOptions}/>
                </fieldset>
                <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                    <legend>
                        <SelectDeselectAll options={restrictionTypes} defaultOptions={defaultRestrictions} updateOptions={updateOptions}/>
                        Restrictions
                    </legend>
                    <OptionList options={restrictionTypes} defaultOptions={defaultRestrictions} updateOptions={updateOptions}/>
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
    const clickHandler = () => {
        const select = !options.size;
        defaultOptions.forEach(option => {
            for (const checkbox of document.getElementsByClassName(`checkbox-${option}`)) {
                console.log(checkbox);
                (checkbox as HTMLInputElement).checked = select;
            }
            select ? options.add(option) : options.delete(option);
            updateOptions();
        });
    }
    const buttonStyle = `w-4 h-4 text-xs border border-quaternary rounded m-1 ${options.size === defaultOptions.size ? "bg-blue-500" : "bg-tertiary"}`;

    return <button className={buttonStyle} onClick={clickHandler}>{!options.size ? " " : options.size === defaultOptions.size ? "✓" :"━"}</button>
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