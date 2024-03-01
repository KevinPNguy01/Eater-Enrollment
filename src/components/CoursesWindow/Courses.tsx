import { CoursesNavBar, SearchTab } from ".."
import { useState } from "react";

export const Courses = () => {
    // React State Hook for keeping track of which tab is selected.
    const [activeTab, setActiveTab] = useState("search");
    
    return (
        <div className="m-1 flex flex-col h-full">
            <CoursesNavBar activeTab={activeTab} setActiveTab={setActiveTab}/>
            <SearchTab activeTab={activeTab}/>
        </div>
    )
}