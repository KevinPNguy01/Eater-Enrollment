import { AppDispatch } from "app/store";
import { SearchBox } from "features/search/components/SearchBox";
import { TermDropDown } from "features/search/components/TermDropDown";
import { useDispatch, useSelector } from "react-redux";
import { selectSearchQuarter, selectSearchYear } from "stores/selectors/Search";
import { setQuarter, setYear } from "stores/slices/Search";

export function SearchForms() {
    const dispatch = useDispatch<AppDispatch>();
    const quarter = useSelector(selectSearchQuarter);
    const year = useSelector(selectSearchYear);

    const setTerm = (quarter: string, year: string) => {
        dispatch(setQuarter(quarter));
        dispatch(setYear(year));
    };

    return (
        <form autoComplete="off" id="searchForm" className={`flex flex-col items-center`} onSubmit={e => e.preventDefault()}>
            <div className="w-full">
                <TermDropDown defaultTerm={{ quarter, year }} setTerm={setTerm} />
            </div>
            <br></br>
            <div className="w-5/6">
                <SearchBox />
            </div>
        </form>
    )
}