import { CoursesNavButton } from "."
import { navLinks } from "../constants"

const CoursesNavBar = (props: {state:string, onClick:Function}) => {
    return(
        <nav className="bg-tertiary h-12 grid grid-cols-3 mb-2">
            {navLinks.slice(1).map((nav, index) => (
                <CoursesNavButton 
                    key={index} 
                    id={nav.id} 
                    title={nav.title}
                    state={props.state}
                    onClick={props.onClick}
                />
            ))}
        </nav>
    )
}

export default CoursesNavBar