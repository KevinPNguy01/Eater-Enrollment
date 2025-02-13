import { AvailableTermsContext } from "app/App";
import { useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSearchQuarter, selectSearchYear } from "stores/selectors/Search";
import { setQuarter, setYear } from "stores/slices/Search";

// All the possible quarter options.
const quarterOptions: Record<string, string> = {
    Fall: "Fall",
    Winter: "Winter",
    Spring: "Spring",
    Summer1: "Summer Session 1",
    Summer10wk: "10-week Summer",
    Summer2: "Summer Session 2",
}

export function TermDropDown() {
    const dispatch = useDispatch();
    const year = useSelector(selectSearchYear);
    const quarter = useSelector(selectSearchQuarter);
    const { availableTerms } = useContext(AvailableTermsContext);

    // React state hook for displaying the current term in the select box.
    const termLabel = useMemo(() => `${quarterOptions[quarter]} ${year}-${parseInt(year) % 100 + 1}`, [quarter, year]);

    return (
        <div className="grid mx-1">
            <label className="text-neutral-300 text-xs">Term</label>
            <select
                className="bg-secondary"
                value="display"
                onChange={({ target }) => {
                    const [quarter, year] = target.value.split(",");
                    dispatch(setQuarter(quarter))
                    dispatch(setYear(year));
                }}
            >
                {/** Hidden option used for displaying the current term. */}
                <option hidden={true} value="display">{termLabel}</option>
                {Object.keys(availableTerms).toReversed().map(key => {
                    const year = parseInt(key);
                    return (
                        <optgroup key={year} label={`${year}-${(year + 1) % 100}`}>
                            {/** Group options by year. */}
                            {availableTerms[key].map(([quarter, quarterString]) => (
                                <option className={``} key={quarter} value={`${quarter},${year}`}>
                                    {quarterString}
                                </option>
                            ))}
                        </optgroup>
                    )
                })}
            </select>
        </div>
    )
}