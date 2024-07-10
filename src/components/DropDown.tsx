/**
 * @param label The label for this dropdown.
 * @param options The options to select.
 * @param default The default option to be selected.
 * @param setter The setter function to call when an option is selected. 
 * @returns 
 */
export function DropDown(props: {label: string, options: string[], default: string, setter: (_: string) => void}) {
    return (
        <div className="grid mx-1">
            <label className="text-neutral-300 text-xs">{props.label}</label>
            <select defaultValue={props.default} onChange={({target}) => props.setter(target.value)}>
                {props.options.map(
                    option => <option key={option} className="bg-secondary">{option}</option>
                )}
            </select>
        </div> 
    )
}