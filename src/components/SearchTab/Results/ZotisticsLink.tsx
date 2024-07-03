import { useState } from "react";
import { CourseOffering, GradeDistributionCollection } from "../../../constants/Types";
import { ZotisticsGraph } from "./ZotisticsGraph";

/**
 * Zotistics link tag for the GradeDistributionCollectionAggregate.
 * Shows a graph displaying the grades on hover.
 * @param instructor The grades to render data for.
 */
export function ZotisticsLink(props: {grades: GradeDistributionCollection, offering: CourseOffering}) {
    const [gradesVisible, setGradesVisible] = useState(false);
    const grades = props.grades;
    if (!grades || !grades.aggregate.average_gpa) return;
    return (
        <div className="relative" >
            <a 
                className="text-sky-500" 
                href={"google.com"} 
                target="_blank" 
                rel="noopener noreferrer" 
                onMouseEnter={()=>setGradesVisible(true)} 
                onMouseLeave={()=>setGradesVisible(false)}
            >
                {grades.aggregate.average_gpa.toFixed(2)}
                <br/>
            </a>
            {gradesVisible ? <ZotisticsGraph grades={grades} offering={props.offering}/> : null}
        </div>
    );
}