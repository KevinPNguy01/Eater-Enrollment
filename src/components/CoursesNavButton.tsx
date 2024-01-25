
const CoursesNavButton = (props: {id:string, title:string, state:string, onClick:Function}) => {
    return (
        <button 
            className={`courses-nav-button h-full ${props.state === props.id ? "active" : "inactive"}`} 
            onClick={() => props.onClick(props.id)}
        >
            {props.title}
        </button>
    )
}

export default CoursesNavButton