import { scheduleQueryToString } from "helpers/ScheduleQuery";
import { useEffect, useState } from "react";
import { ScheduleQuery } from "types/ScheduleQuery";
import { SearchSuggestion, getSuggestions } from "../utils/FormHelpers";
import { SearchBubble } from "./SearchBubble";
import { SearchList } from "./SearchList";

export function SearchBox(props: { queriesState: [ScheduleQuery[], (queries: ScheduleQuery[]) => void], multiState: [boolean, (_: boolean) => void], defaultScheduleQuery: ScheduleQuery, lastQueries: ScheduleQuery[], submitQueries: (queries?: ScheduleQuery[]) => void }) {
    const { defaultScheduleQuery, lastQueries } = props;
    const [queries, setQueries] = props.queriesState;
    const [multi, setMulti] = props.multiState;
    const [focus, setFocus] = useState(false);
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([] as SearchSuggestion[])

    useEffect(() => {
        if (lastQueries.length && !multi) setInput(scheduleQueryToString(lastQueries[0]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastQueries]);

    // Functions for manipulating the search queries.
    const addScheduleQuery = (ScheduleQuery: ScheduleQuery) => {
        setSuggestions([]);
        if (multi) {
            setQueries([...queries, { ...defaultScheduleQuery, ...ScheduleQuery }]);
            setInput("");
        } else {
            props.submitQueries([{ ...defaultScheduleQuery, ...ScheduleQuery }]);
        }
    };
    const deleteScheduleQuery = (index: number) => {
        setQueries([...queries.slice(0, index), ...queries.slice(index + 1)]);
    };
    const submitQueries = (queries?: ScheduleQuery[]) => {
        props.submitQueries(multi ? queries : getSuggestions(input).map(({ value }) => ({ ...defaultScheduleQuery, ...value })).slice(0, 1));
    };

    const searchBubble = (
        <SearchBubble
            inputState={[input, setInput]}
            focusState={[focus, setFocus]}
            multiState={[multi, setMulti]}
            queriesState={[queries, setQueries]}
            suggestionsState={[suggestions, setSuggestions]}
            addQuery={addScheduleQuery}
            deleteQuery={deleteScheduleQuery}
            submitQueries={submitQueries}
        />
    );
    return (
        <div className="relative w-full ">
            {searchBubble}
            <div className={`top-0 left-0 absolute flex flex-col w-full items-center bg-secondary border border-quaternary z-20 rounded-[20px] hover:shadow-[0px_0px_10px_#0008] ${focus ? "shadow-[0px_0px_10px_#0008]" : ""}`}>
                {searchBubble}
                {focus ? <SearchList suggestions={suggestions} appendFunction={addScheduleQuery} /> : null}
            </div>
        </div>
    )
}