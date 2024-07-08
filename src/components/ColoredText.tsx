export function ColoredText(props: {className?: string, text: string, colorRules: Map<string, string>}) {
    return (
        <p className={`${props.className || ""} ${props.colorRules.get(props.text) || ""}`}>
            {props.text}
        </p>
    )
}