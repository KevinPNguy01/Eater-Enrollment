interface Props {
    id: string;
    title: string;
    activeTab: string;
    setActiveTab: (a: string) => void;
}

export const CoursesNavButton = (props: Props) => {
    return (
        <button 
            className={`courses-nav-button h-full ${props.activeTab === props.id ? "active" : "inactive"}`} 
            onClick={() => props.setActiveTab(props.id)}
        >
            {props.title}
        </button>
    )
}
