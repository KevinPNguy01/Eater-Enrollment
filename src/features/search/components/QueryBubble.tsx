import { Query } from "../../../utils/PeterPortal";

const bubbleStyle = "flex items-center whitespace-nowrap border border-quaternary bg-tertiary px-4 m-1 rounded-full group hover:pr-0 hover:bg-red-500 hover:cursor-pointer";

/**
 * @param query The query to display in this bubble.
 * @param removeFunction Called to remove this bubble and query.
 */
export function QueryBubble(props: {query: Query, removeFunction: () => void}) {
    const {query, removeFunction} = props;

    return (
        <div className={bubbleStyle} onClick={removeFunction}>
            {query.ge ? query.ge : query.department + (query.number ? ` ${query.number}` : "")}
            <span className="pl-3 hidden group-hover:block group-hover:pr-3">✕</span>
        </div>
    )
}