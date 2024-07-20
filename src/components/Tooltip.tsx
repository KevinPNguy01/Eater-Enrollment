export function Tooltip(props: {className?: string, text: string}) {
    return (
        <p className={`absolute ${props.className}`}>{props.text}</p>
    )
}