import { useContext } from "react";
import { ScheduleOptions } from "../../../helpers/PeterPortal";
import { SearchContext } from "../SearchTab";

export function QueryBubble(props: {query: ScheduleOptions, index: number}) {
    const {queries, setQueries} = useContext(SearchContext);
    const {query, index} = props;

    const handleClick = () => {
        queries.splice(index, 1)
        setQueries(queries.slice());
    }

    return (
        <div className="whitespace-nowrap border border-quaternary bg-tertiary px-4 m-1 rounded-full hover:bg-red-500 hover:cursor-pointer" onClick={handleClick}>
            {query.department + (query.number ? ` ${query.number}` : "")}
        </div>
    )
}