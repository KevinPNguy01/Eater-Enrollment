export const DropDown = (props: {label: string, name: string, options: any[], selected?: any}) => {
  return (
    <div className="drop-down grid mx-1">
        <label>
            {props.label}
        </label>
        <select name={props.name} defaultValue={props.selected}>
            {props.options.map(
                (option) => (<option key={option}>{option}</option>)
            )}
        </select>
    </div> 
  )
}
