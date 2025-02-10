import { SearchBox } from "features/search/components/SearchBox";
import { TermDropDown } from "features/search/components/TermDropDown";

export function SearchForms() {
    return (
        <form autoComplete="off" id="searchForm" className={`flex flex-col items-center`} onSubmit={e => e.preventDefault()}>
            <div className="w-full">
                <TermDropDown />
            </div>
            <br></br>
            <div className="w-5/6">
                <SearchBox />
            </div>
        </form>
    )
}