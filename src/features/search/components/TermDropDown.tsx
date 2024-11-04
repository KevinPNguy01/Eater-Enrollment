import { useState } from "react";

// All the possible quarter options.
const quarterOptions: Record<string, string> = {
    Fall: "Fall",
    Winter: "Winter",
    Spring: "Spring",
    Summer1: "Summer Session 1",
    Summer10wk: "10-week Summer",
    Summer2: "Summer Session 2",
}
const quarterKeys = Object.keys(quarterOptions);

// Current year and quarter
const currentYear = 2024;
const currentQuarter = "Winter";

// Range of years from 2015-Current Year.
const yearOptions = Array.from({ length: currentYear - 2015 + 1 }, (_, index) => (currentYear - index - 1));

// Determine quarters for current year.
const endQuarterIndex = 1 + quarterKeys.findIndex(q => q === currentQuarter);
const currentQuarters = quarterKeys.slice(0, endQuarterIndex);

// Generate all quarters for past years.
const pastQuarters = yearOptions.map(year => [year, quarterKeys] as [number, string[]]);

// Group current and past quarters.
const termGroups: [number, string[]][] = [[currentYear, currentQuarters], ...pastQuarters]

export function TermDropDown(props: { defaultTerm: { quarter: string, year: string }, setTerm: (quarter: string, year: string) => void }) {
    const { setTerm } = props;

    // React state hook for displaying the current term in the select box.
    const [termLabel, setTermLabel] = useState(`${currentQuarter} ${currentYear}-${currentYear % 100 + 1}`);

    return (
        <div className="grid mx-1">
            <label className="text-neutral-300 text-xs">Term</label>
            <select
                className="bg-secondary"
                value="display"
                onChange={({ target }) => {
                    const [quarter, year] = target.value.split(",");
                    setTerm(quarter, (parseInt(year) + (quarter === "Fall" ? 0 : 1)).toString());
                    setTermLabel(`${quarterOptions[quarter]} ${year}-${parseInt(year) % 100 + 1}`)
                }}
            >
                {/** Hidden option used for displaying the current term. */}
                <option hidden={true} value="display">{termLabel}</option>
                {termGroups.map(([year, quarters]) => (
                    <optgroup key={year} label={`${year}-${(year + 1) % 100}`}>
                        {/** Group options by year. */}
                        {quarters.map(quarter => (
                            <option className={``} key={quarter} value={`${quarter},${year}`}>
                                {quarterOptions[quarter]}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
    )
}