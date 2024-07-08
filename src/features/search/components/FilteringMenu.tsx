import { useContext } from "react";
import { statusColors, typeColors } from "../../../constants/TextColors";
import { restrictionCodes } from "../../../constants/RestrictionCodes";
import { SearchContext } from "../../../app/pages/CoursesPane";
import { FilteringOptions } from "../../../app/pages/SearchResults";
import { ColoredText } from "../../../components/ColoredText";

export function FilterMenu(props: {filteringOptions: FilteringOptions}) {
    const {sectionTypes, setSectionTypes, statusTypes, setStatusTypes, dayTypes, setDayTypes, restrictionTypes, setRestrictionTypes} = props.filteringOptions;
    const {searchResults} = useContext(SearchContext);
    const sectionOptions = Array.from(new Set(searchResults.map(({offerings}) => offerings.map(({section}) => section.type)).flat()));
    const statusOptions = Array.from(statusColors.keys())
    const dayOptions = ["M", "Tu", "W", "Th", "F"];
    const restrictionOptions = Array.from(new Set(searchResults.map(({offerings}) => offerings.map(({restrictions}) => restrictions.replace("or", "and").split(" and ")).flat()).flat().filter(s => s)));
    return (
        <div className="bg-secondary border top-full left-0 my-1 p-4 border-quaternary absolute z-10 text-base text-left">
            <p className="text-xl whitespace-pre border-b border-quaternary mb-2">{"Search Filters"}</p>
            <div className="grid grid-flow-col auto-cols-auto gap-4">
                <fieldset className="border border-quaternary p-2">
                    <legend>Section Type</legend>
                        <div className="grid grid-cols-2 font-bold">
                            {sectionOptions.map(option => {
                                return (
                                    <div className="flex">
                                        <input type="checkbox" id={option} name={option} defaultChecked={sectionTypes.has(option)} className={`text-left my-1 checkbox-${option}`} onChange={e => {
                                            e.target.checked ? sectionTypes.add(e.target.name) : sectionTypes.delete(e.target.name);
                                            setSectionTypes(new Set(sectionTypes));
                                        }}/>
                                        <ColoredText className="ml-1" text={option} colorRules={typeColors}/>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex">
                            <button className="border border-quaternary rounded hover:bg-tertiary m-1 p-1 text-sm" onClick={() => {
                                    // Select all the options.
                                    sectionOptions.forEach(option => {
                                        for (const checkbox of document.getElementsByClassName(`checkbox-${option}`)) {
                                            (checkbox as HTMLInputElement).checked = true;
                                        }
                                        setSectionTypes(new Set(sectionOptions));
                                    });
                                }}>
                                    Select All
                                </button>
                                <button className="border border-quaternary rounded hover:bg-tertiary m-1 p-1 text-sm" onClick={() => {
                                    // Deselect all the options.
                                    sectionOptions.forEach(option => {
                                        for (const checkbox of document.getElementsByClassName(`checkbox-${option}`)) {
                                            (checkbox as HTMLInputElement).checked = false;
                                        }
                                        setSectionTypes(new Set());
                                    });
                                }}>
                                    Deselect All
                                </button>
                        </div>
                </fieldset>
                <fieldset className="border border-quaternary p-2">
                    <legend>Status</legend>
                    <div>
                        {statusOptions.map(option => {
                            return (
                                <div className="flex font-bold">
                                    <input type="checkbox" id={option} name={option} defaultChecked={statusTypes.has(option)} className={`text-left my-1 checkbox-${option}`} onChange={e => {
                                        if (e.target.checked) {
                                            statusTypes.add(e.target.name);
                                        } else {
                                            statusTypes.delete(e.target.name);
                                        }
                                        setStatusTypes(new Set(statusTypes));
                                    }}/>
                                    <ColoredText className="ml-1" text={option} colorRules={statusColors}/>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
                <fieldset className="border border-quaternary p-2">
                    <legend>Days</legend>
                    <div>
                        {dayOptions.map(option => {
                            return (
                                <div className="flex font-bold">
                                    <input type="checkbox" id={option} name={option} defaultChecked={dayTypes.has(option)} className={`text-left my-1 checkbox-${option}`} onChange={e => {
                                        if (e.target.checked) {
                                            dayTypes.add(e.target.name);
                                        } else {
                                            dayTypes.delete(e.target.name);
                                        }
                                        setDayTypes(new Set(dayTypes));
                                    }}/>
                                    <p className="ml-1 mr-8">{option}</p>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
                <fieldset className="border border-quaternary p-2">
                    <legend>Restrictions</legend>
                    <div>
                        {restrictionOptions.map(option => {
                            return (
                                <div className="flex font-bold">
                                    <input type="checkbox" id={option} name={option} defaultChecked={restrictionTypes.has(option)} className={`text-left my-1 checkbox-${option}`} onChange={e => {
                                        if (e.target.checked) {
                                            restrictionTypes.add(e.target.name);
                                        } else {
                                            restrictionTypes.delete(e.target.name);
                                        }
                                        setRestrictionTypes(new Set(restrictionTypes));
                                    }}/>
                                    <div className="flex">
                                        <p className="ml-1">{`${option}: `}</p>
                                        <p className="whitespace-normal w-64">{restrictionCodes.get(option)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex">
                        <button className="border border-quaternary rounded hover:bg-tertiary m-1 p-1 text-sm" onClick={() => {
                                // Select all the options.
                                restrictionOptions.forEach(option => {
                                    for (const checkbox of document.getElementsByClassName(`checkbox-${option}`)) {
                                        (checkbox as HTMLInputElement).checked = true;
                                    }
                                    setRestrictionTypes(new Set(restrictionOptions));
                                });
                            }}>
                                Select All
                            </button>
                            <button className="border border-quaternary rounded hover:bg-tertiary m-1 p-1 text-sm" onClick={() => {
                                // Deselect all the options.
                                restrictionOptions.forEach(option => {
                                    for (const checkbox of document.getElementsByClassName(`checkbox-${option}`)) {
                                        (checkbox as HTMLInputElement).checked = false;
                                    }
                                    setRestrictionTypes(new Set());
                                });
                            }}>
                                Deselect All
                            </button>
                    </div>
                </fieldset>
            </div>
        </div>
    )
}