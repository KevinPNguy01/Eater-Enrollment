export function SearchButton(props: {submit: () => void}) {
    return (
        <div className="flex w-full content-center justify-center">
            <span className="bg-primary w-1/2 p-1 m-8 rounded text-center hover:cursor-pointer" onClick={() => props.submit()}>
                Search
            </span>
        </div>
    )
}