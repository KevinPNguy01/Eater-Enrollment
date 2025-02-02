import { useEffect, useRef } from "react";
import { ScheduleQuery } from "types/ScheduleQuery";

const bubbleStyle = "flex items-center whitespace-nowrap border border-quaternary bg-tertiary px-4 rounded-full group hover:pr-0 hover:bg-red-500 hover:cursor-pointer";

/**
 * @param query The query to display in this bubble.
 * @param removeFunction Called to remove this bubble and query.
 */
export function QueryBubble(props: { query: ScheduleQuery, onClick: () => void }) {
    const { query, onClick } = props;
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: TouchEvent) => {
            e.preventDefault()
            onClick();
        };
        const bubble = ref.current;
        if (bubble) {
            bubble.addEventListener("touchstart", handler);
            return () => bubble.removeEventListener("touchstart", handler);
        }
    }, [onClick, ref]);

    return (
        <div ref={ref} className={bubbleStyle} onClick={onClick}>
            {query.ge ? query.ge : query.department + (query.number ? ` ${query.number}` : "")}
            <div className="px-1 hidden group-hover:block">
                <svg
                    className="hover:cursor-pointer"
                    focusable="false"
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                >
                    <path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
            </div>
        </div>
    )
}