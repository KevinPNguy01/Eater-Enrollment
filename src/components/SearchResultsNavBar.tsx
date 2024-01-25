import { useEffect } from "react"

const SearchResultsNavBar = (props: {setSearched: Function, results: boolean, setResults: Function}) => (
    <nav>
        <button onClick={() => {
                props.setResults(false);
                props.setSearched([])
            }}>
            Back
        </button>
    </nav>
)

export default SearchResultsNavBar