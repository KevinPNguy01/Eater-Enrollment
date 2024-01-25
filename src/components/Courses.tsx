import { CoursesNavBar } from "."
import { Search } from "./Search"
import { useState } from "react";

const Courses = () => {
    const [active, setActive] = useState("search");
    return (
        <section className="m-1 flex flex-col h-full">
            <CoursesNavBar state={active} onClick={setActive}/>
            <Search active={active}/>
        </section>
    )
}

export default Courses