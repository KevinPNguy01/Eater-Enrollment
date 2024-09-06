export function Tooltip(props: { className?: string, text: string }) {
    return (
        <p className={`absolute z-[1000] ${props.className}`}>{props.text}</p>
    )
}