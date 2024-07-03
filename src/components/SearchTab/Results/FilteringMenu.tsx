import { FilteringOptions } from "./SearchResults";

export function FilterMenu(props: {filteringOptions: FilteringOptions}) {
    const {sectionTypes, setSectionTypes, statusTypes, setStatusTypes} = props.filteringOptions;
    const sectionOptions = ["Lec", "Dis", "Lab", "Sem", "Stu", "Tut", "Act", "Res", "Fld", "Col", "Qiz", "Tap"]
    const statusOptions = ["OPEN", "NewOnly", "Waitl", "FULL"];
    return (
        <div className="bg-secondary border top-full left-0 my-1 p-4 border-quaternary absolute z-10 text-base text-left">
            <p className="text-xl whitespace-pre border-b border-quaternary mb-2">{"Search Filters"}</p>
            <div className="grid grid-flow-col auto-cols-auto	">
                <fieldset className="border border-quaternary p-2 mr-4">
                    <legend>Section Type</legend>
                        <div className="grid grid-cols-[1fr_1fr]">
                            {sectionOptions.map(option => {
                                return (
                                    <div>
                                        <input type="checkbox" id={option} name={option} defaultChecked={sectionTypes.has(option)} className={`text-left my-1 checkbox-${option}`} onChange={e => {
                                            if (e.target.checked) {
                                                sectionTypes.add(e.target.name);
                                            } else {
                                                sectionTypes.delete(e.target.name);
                                            }
                                            setSectionTypes(new Set(sectionTypes));
                                        }}/>
                                        <label htmlFor={option} className="whitespace-pre">{" "+option}</label>
                                    </div>
                                );
                            })}
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
                                        <div>
                                            <input type="checkbox" id={option} name={option} defaultChecked={statusTypes.has(option)} className={`text-left my-1 checkbox-${option}`} onChange={e => {
                                                if (e.target.checked) {
                                                    statusTypes.add(e.target.name);
                                                } else {
                                                    statusTypes.delete(e.target.name);
                                                }
                                                setStatusTypes(new Set(statusTypes));
                                            }}/>
                                            <label htmlFor={option} className="whitespace-pre">{" "+option}</label>
                                        </div>
                                    );
                                })}
                    </div>
                </fieldset>
            </div>
        </div>
    )
}