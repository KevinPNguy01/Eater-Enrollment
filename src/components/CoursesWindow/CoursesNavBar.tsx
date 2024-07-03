import { CoursesNavButton } from ".."
import { navLinks } from "../../constants/Links"

interface Props {
    activeTab: string;
    setActiveTab: (a: string) => void;
}

export const CoursesNavBar = (props: Props) => {
    return(
        <nav className="bg-tertiary h-12 grid grid-cols-3 mb-2">
            {navLinks.slice(1).map((nav, index) => (
                <CoursesNavButton 
                    key={index} 
                    id={nav.id} 
                    title={nav.title}
                    activeTab={props.activeTab}
                    setActiveTab={props.setActiveTab}
                />
            ))}
        </nav>
    )
}