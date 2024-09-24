import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import IconButton from "@mui/material/IconButton";
import Slider from '@mui/material/Slider';
import { BpCheckbox } from 'components/BpCheckbox';
import { ColoredText } from "components/ColoredText";
import { statusColors, typeColors } from "constants/TextColors";
import { FilterOptions } from "../types/options";
import moment from 'moment';

export function FilterMenu(props: { optionsState: [FilterOptions, (options: FilterOptions) => void], defaultOptions: FilterOptions, openState: [boolean, (_: boolean) => void] }) {
    const [options, setOptions] = props.optionsState;
    const [open, setOpen] = props.openState;
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
    return (
        <Dialog
            open={open}
        >
            <div className="flex items-center justify-between text-xl whitespace-pre border-b border-quaternary px-4 mt-2">
                {"Search Filters"}
                <IconButton color="info" onClick={() => setOpen(false)}>
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
                    <fieldset className="border border-quaternary px-4 py-4 flex flex-col justify-between" onMouseDown={e => e.preventDefault()}>
                        <legend>Time</legend>
                        <div className="px-4">
                            <Slider
                                min={480}
                                max={1440}
                                step={10}
                                defaultValue={options.timeRange}
                                onChangeCommitted={(_, newValue) => {
                                    setOptions({ ...options, timeRange: newValue as [number, number] })
                                }}
                                valueLabelDisplay="auto"
                                valueLabelFormat={value => {
                                    const time = moment(`${Math.floor(value / 60)}:${value % 60}`, "h:m");
                                    return time.format("hh:mm A");
                                }}
                                marks={Array.from({ length: 8 }, (_, k) => {
                                    const seconds = k * 240 + 480;
                                    return {
                                        value: seconds,
                                        label: moment(`${Math.floor(seconds / 60)}:${seconds % 60}`, "h:m").format("h a")
                                    }
                                })}
                            />
                        </div>
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
        </Dialog>
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

    return <BpCheckbox
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
            {Array.from(defaultOptions).map((option, index) => (
                <div className="flex items-center">
                    <BpCheckbox
                        key={index}
                        checkBoxSize={16}
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