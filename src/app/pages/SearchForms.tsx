import { SearchBox } from "features/search/components/SearchBox";
import { TermDropDown } from "features/search/components/TermDropDown";
import { ScheduleQuery } from "types/ScheduleQuery";

export function SearchForms(props: { queriesState: [ScheduleQuery[], (queries: ScheduleQuery[]) => void], multiState: [boolean, (_: boolean) => void], defaultScheduleQueryState: [ScheduleQuery, (queries: ScheduleQuery) => void], submit: (queries?: ScheduleQuery[]) => void }) {
    const { multiState, submit } = props;
    const [queries, setQueries] = props.queriesState;
    const [defaultScheduleQuery, setDefaultScheduleQuery] = props.defaultScheduleQueryState;
    const { quarter, year } = defaultScheduleQuery;
    const setTerm = (quarter: string, year: string) => setDefaultScheduleQuery({ quarter, year });

    return (
        <form autoComplete="off" id="searchForm" className={`flex flex-col items-center`} onSubmit={e => e.preventDefault()}>
            <div className="w-full">
                <TermDropDown defaultTerm={{ quarter, year }} setTerm={setTerm} />
            </div>
            <br></br>
            <div className="w-5/6">
                <SearchBox queriesState={[queries, setQueries]} multiState={multiState} defaultScheduleQuery={defaultScheduleQuery} lastQueries={[]} submitQueries={submit} />
            </div>
        </form>
    )
}