import { AddedTab } from "./AddedTab";
import { MapTab } from "./MapTab";
import { SearchForms } from "./SearchForms";
import { SearchResults } from "./SearchResults";
import { useSelector } from "react-redux";
import { selectDisplayResults } from "stores/selectors/Search";
import { useState } from "react";
import { CalendarPane } from "./CalendarPane";
import { navLinks } from "constants/Links";

export function CoursesPane(props: { includeCalendar: boolean }) {
    const { includeCalendar } = props;
    const [activeTab, setActiveTab] = useState(includeCalendar ? "calendar" : "search");
    const displaySearchResults = useSelector(selectDisplayResults);

    // When switching to split screen, calendar tab won't exist in CoursesPane.
    if (activeTab === "calendar" && !includeCalendar) {
        setActiveTab("search");
    }

    return (
        <div className="m-1 flex flex-col h-full gap-1">
            <nav className="bg-tertiary h-8 md:h-12 grid grid-flow-col shrink-0">
                {/** Generate nav buttons for Search, Added, Map, and Calendar if appropriate. */}
                {navLinks.slice(includeCalendar ? 0 : 1).map(({ id, title }) => (
                    <button
                        key={id}
                        className={`text-xs md:text-lg h-full ${id === activeTab ? "border-b-4 border-primary" : "text-neutral-300"}`}
                        onClick={() => setActiveTab(id)}
                    >
                        {title}
                    </button>

                ))}
            </nav>
            {/** Return page components depending on the active tab. */}
            {(function getActiveTab() {
                switch (activeTab) {
                    case "calendar": return <CalendarPane />;
                    case "search": return displaySearchResults ? <SearchResults /> : <SearchForms />;
                    case "added": return <AddedTab />;
                    case "map": return <MapTab />;
                }
            })()}
        </div>
    )
}