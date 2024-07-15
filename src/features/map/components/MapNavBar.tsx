const days: [string, number][] = [
    ["All", 0b11111],
    ["Mon", 0b10000],
    ["Tue", 0b01000],
    ["Wed", 0b00100],
    ["Thu", 0b00010],
    ["Fri", 0b00001]
]

export function MapNavBar(props: {activeDayState: [number, (_: number) => void]}) {
    const [daysMask, setDaysMask] = props.activeDayState;
    return (
        <div className="w-3/4 grid grid-cols-6 absolute z-[1000] h-fit left-1/2 -translate-x-1/2 mt-4 bg-tertiary border border-quaternary rounded font-bold">
            {days.map(([day, mask]) => 
                    <button className={`py-2 border-primary ${mask === daysMask ? "border-b-4" : ""}`} onClick={() => setDaysMask(mask)}>{day}</button>
            )}
        </div>
    )
}