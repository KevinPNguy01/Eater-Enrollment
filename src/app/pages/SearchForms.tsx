import { DropDown } from "../../components/DropDown";
import { SearchBox } from "../../features/search/components/SearchBox";
import { SearchButton } from "../../features/search/components/SearchButton";
import { Query } from "../../utils/PeterPortal";

export function SearchForms(props: {queriesState: [Query[], (queries: Query[]) => void], defaultQueryState: [Query, (queries: Query) => void], submit: () => void}) {
    const {submit} = props;
    const [queries, setQueries] = props.queriesState;
    const [defaultQuery, setDefaultQuery] = props.defaultQueryState;

    const {quarter, year} = defaultQuery;
    const setQuarter = (quarter: string) => setDefaultQuery({...defaultQuery, quarter});
    const setYear = (year: string) => setDefaultQuery({...defaultQuery, year});
    
    const termOptions = ["Fall", "Winter", "Spring", "Summer Session 1", "Summer Session 2", "10-wk Summer"];
    const yearOptions = Array.from({ length: new Date().getFullYear() - 2015 + 2}, (_, index) => (new Date().getFullYear()+1 - index).toString());
    return (
        <form autoComplete="off" id="searchForm" className={`flex flex-col h-1 grow`} onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-2">
                <DropDown label="Quarter" options={termOptions} default={quarter} setter={setQuarter}/>
                <DropDown label="Year" options={yearOptions} default={year} setter={setYear}/>
            </div>
            <br></br>
            <div className="relative flex-grow">
                <SearchBox queriesState={[queries, setQueries]} defaultQuery={{quarter, year}} submit={submit}/>
                <SearchButton submit={submit}/>
            </div>
        </form>
    )
}