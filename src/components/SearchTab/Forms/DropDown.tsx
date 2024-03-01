export function DropDown(props: {label: string, name: string, options: string[], default: string}) {
  return (
    <div className="drop-down grid mx-1">
        <label> {props.label} </label>
        <select name={props.name} defaultValue={props.default}>
            {props.options.map(
                (option) => (<option key={option}>{option}</option>)
            )}
        </select>
    </div> 
  )
}