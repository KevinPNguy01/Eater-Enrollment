export function DropDown(props: {label: string, name: string, options: string[], default: string, setter: (_: string) => void}) {
  return (
    <div className="drop-down grid mx-1">
        <label> {props.label} </label>
        <select name={props.name} defaultValue={props.default} onChange={({target}) => props.setter(target.options[target.selectedIndex].value)}>
            {props.options.map(
                (option) => (<option key={option}>{option}</option>)
            )}
        </select>
    </div> 
  )
}