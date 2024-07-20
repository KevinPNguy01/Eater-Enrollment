import { SearchBox } from "../../features/search/components/SearchBox";
import { TermDropDown } from "../../features/search/components/TermDropDown";
import { Query } from "../../utils/PeterPortal";

export function SearchForms(props: {queriesState: [Query[], (queries: Query[]) => void], multiState: [boolean, (_: boolean) => void], defaultQueryState: [Query, (queries: Query) => void], submit: (queries?: Query[]) => void}) {
    const {multiState, submit} = props;
    const [queries, setQueries] = props.queriesState;
    const [defaultQuery, setDefaultQuery] = props.defaultQueryState;
    const {quarter, year} = defaultQuery;
    const setTerm = (quarter: string, year: string) => setDefaultQuery({quarter, year});
    
    return (
        <form autoComplete="off" id="searchForm" className={`flex flex-col items-center`} onSubmit={e => e.preventDefault()}>
            <div className="w-full">
                <TermDropDown defaultTerm={{quarter, year}} setTerm={setTerm}/>
            </div>
            <br></br>
            <div className="w-5/6">
                <SearchBox queriesState={[queries, setQueries]} multiState={multiState} defaultQuery={defaultQuery} lastQueries={[]} submitQueries={submit}/>
            </div>
        </form>
    )
}