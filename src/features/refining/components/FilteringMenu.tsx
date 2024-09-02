import CloseIcon from '@mui/icons-material/Close';
import Backdrop from "@mui/material/Backdrop";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import { ColoredText } from "components/ColoredText";
import { statusColors, typeColors } from "constants/TextColors";
import MultiRangeSlider from "multi-range-slider-react";
import { useState } from "react";
import { FilterOptions } from "../types/options";

export function FilterMenu(props: { optionsState: [FilterOptions, (options: FilterOptions) => void], defaultOptions: FilterOptions, close: () => void }) {
    const [options, setOptions] = props.optionsState;
    const { defaultOptions } = props;
    const updateOptions = () => setOptions({ ...options });
    const { sectionTypes, statusTypes, dayTypes, restrictionTypes, levelTypes } = options;
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
        <Backdrop className="!absolute z-20" open onClick={props.close}>
            <Card
                onClick={e => e.stopPropagation()}
                elevation={3}
                className="flex flex-col bg-secondary border top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 my-1 border-quaternary absolute z-10 text-base text-left w-3/4 max-h-[75%] hide-scroll"
            >
                <div className="flex items-center justify-between text-xl whitespace-pre border-b border-quaternary px-4 mt-2">
                    {"Search Filters"}
                    <IconButton color="info" onClick={props.close}>
                        <CloseIcon />
                    </IconButton>
                </div>
                <div className="flex flex-wrap flex-grow *:flex-grow gap-4 p-4 !overflow-y-auto">
                    <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                        <legend>
                            <SelectDeselectAll options={sectionTypes} defaultOptions={defaultSections} updateOptions={updateOptions} />
                            <span className="">Section Type</span>
                        </legend>
                        <OptionList className="grid grid-cols-2" options={sectionTypes} defaultOptions={defaultSections} updateOptions={updateOptions} colorRules={typeColors} />
                    </fieldset>
                    <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                        <legend>
                            <SelectDeselectAll options={statusTypes} defaultOptions={defaultStatuses} updateOptions={updateOptions} />
                            <span className="">Status</span>
                        </legend>
                        <OptionList options={statusTypes} defaultOptions={defaultStatuses} updateOptions={updateOptions} colorRules={statusColors} />
                    </fieldset>
                    <div className="grid">
                        <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                            <legend>
                                <SelectDeselectAll options={dayTypes} defaultOptions={defaultDays} updateOptions={updateOptions} />
                                <span className="">Days</span>
                            </legend>
                            <OptionList className="flex flex-wrap gap-x-4" options={dayTypes} defaultOptions={defaultDays} updateOptions={updateOptions} />
                        </fieldset>
                        <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                            <legend>Time</legend>
                            <MultiRangeSlider
                                className="!border-none !shadow-none"
                                labels={["8", "10", "12", "2", "4", "6", "8", "10"]}
                                min={480} minValue={options.timeRange[0]} max={1320} maxValue={options.timeRange[1]} step={10} stepOnly={true}
                                minCaption={minCaption}
                                maxCaption={maxCaption}
                                onInput={e => {
                                    const toTimeString = (totalMinutes: number) => {
                                        const hours = Math.floor(totalMinutes / 60);
                                        const minutes = totalMinutes % 60;
                                        return `${(hours % 12) || 12}:${minutes.toString().padEnd(2, "0")} ${hours >= 12 ? "pm" : "am"}`;
                                    }
                                    setMinCaption(toTimeString(e.minValue));
                                    setMaxCaption(toTimeString(e.maxValue));
                                }}
                                onChange={e => setOptions({ ...options, timeRange: [e.minValue, e.maxValue] })}
                                barInnerColor="#0090ff"
                            />
                        </fieldset>
                    </div>
                    <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                        <legend>
                            <SelectDeselectAll options={levelTypes} defaultOptions={defaultLevels} updateOptions={updateOptions} />
                            <span className="">Course Level</span>
                        </legend>
                        <OptionList options={levelTypes} defaultOptions={defaultLevels} updateOptions={updateOptions} />
                    </fieldset>
                    <fieldset className="border border-quaternary p-2 flex flex-col justify-between">
                        <legend>
                            <SelectDeselectAll options={restrictionTypes} defaultOptions={defaultRestrictions} updateOptions={updateOptions} />
                            <span className="">Restrictions</span>
                        </legend>
                        <OptionList options={restrictionTypes} defaultOptions={defaultRestrictions} updateOptions={updateOptions} />
                    </fieldset>
                </div>
            </Card>
        </Backdrop>
    );
}

/**
 * Component contain buttons to select/deselect all options.
 * @param options The options to modify.
 * @param defaultOptions The options to select/deselect.
 * @param updateOptions A function to update the options after modifying.
 */
function SelectDeselectAll(props: { options: Set<string>, defaultOptions: Set<string>, updateOptions: () => void }) {
    const { options, defaultOptions, updateOptions } = props;

    // Event handler to either select or deselect all the options when button is clicked.
    const clickHandler = () => {
        const select = !options.size;
        defaultOptions.forEach(option => {
            select ? options.add(option) : options.delete(option);
            updateOptions();
        });
    }

    return <Checkbox
        color="secondary"
        checked={options.size === defaultOptions.size}
        indeterminate={options.size > 0 && options.size !== defaultOptions.size}
        onChange={clickHandler}
    />
}

/**
 * @param options The options to modify.
 * @param defaultOptions The options to render the checkboxes and labels for.
 * @param updateOptions A function to update the options after modifying.
 * @returns An array of components containing checkbox/label pairs for the given default options.
 */
function OptionList(props: { className?: string, options: Set<string>, defaultOptions: Set<string>, updateOptions: () => void, colorRules?: Map<string, string> }) {
    const { className, options, defaultOptions, updateOptions, colorRules } = props;

    return (
        <div className={className}>
            {Array.from(defaultOptions).map(option => (
                <div className="flex items-center">
                    <Checkbox
                        size="small"
                        color="secondary"
                        name={option}
                        checked={options.has(option)}
                        className={`text-left my-1 checkbox-${option}`}
                        onChange={e => {
                            e.target.checked ? options.add(e.target.name) : options.delete(e.target.name);
                            updateOptions();
                        }}
                    />
                    <ColoredText className="font-semibold text-wrap" text={option} colorRules={colorRules} />
                </div>
            ))}
        </div>
    );
}