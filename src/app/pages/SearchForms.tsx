import { SearchBox } from "../../features/search/components/SearchBox";
import { SearchButton } from "../../features/search/components/SearchButton";
import { TermDropDown } from "../../features/search/components/TermDropDown";
import { Query } from "../../utils/PeterPortal";

export function SearchForms(props: {queriesState: [Query[], (queries: Query[]) => void], defaultQueryState: [Query, (queries: Query) => void], submit: () => void}) {
    const {submit} = props;
    const [queries, setQueries] = props.queriesState;
    const [defaultQuery, setDefaultQuery] = props.defaultQueryState;
    const {quarter, year} = defaultQuery;
    const setTerm = (quarter: string, year: string) => setDefaultQuery({quarter, year});
    
    return (
        <form autoComplete="off" id="searchForm" className={`flex flex-col h-1 grow`} onSubmit={e => e.preventDefault()}>
            <div className="">
                <TermDropDown defaultTerm={{quarter, year}} setTerm={setTerm}/>
            </div>
            <br></br>
            <div className="relative flex-grow">
                <SearchBox queriesState={[queries, setQueries]} defaultQuery={defaultQuery} submit={submit}/>
                <SearchButton submit={submit}/>
            </div>
        </form>
    )
}