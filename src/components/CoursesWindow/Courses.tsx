import { CoursesNavBar, SearchTab } from ".."
import { useState } from "react";
import { AddedTab } from "../AddedTab/AddedTab";

export const Courses = () => {
    // React State Hook for keeping track of which tab is selected.
    const [activeTab, setActiveTab] = useState("search");
    
    return (
        <div className="relative m-1 flex flex-col h-full">
            <CoursesNavBar activeTab={activeTab} setActiveTab={setActiveTab}/>
            <SearchTab activeTab={activeTab}/>
            <AddedTab activeTab={activeTab}/>
        </div>
    )
}