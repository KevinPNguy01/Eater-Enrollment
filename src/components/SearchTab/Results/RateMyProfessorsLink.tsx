import { useState } from "react";
import { Instructor } from "../../../constants/types";
import { RateMyProfessorsReview } from "./RateMyProfessorsReview";

/**
 * RateMyProfessors link tag for the given instructor, or a regular text tag if the instructor is STAFF.
 * Shows a preview of the instructor on RateMyProfessors on hover.
 * @param instructor The instructor to render the RateMyProfessors data for.
 */
export function RateMyProfessorsLink(props: {instructor: Instructor}) {
    const [reviewVisible, setReviewVisible] = useState(false);
    const name = props.instructor.shortened_name;
    const review = props.instructor.review;
    const rmp_link = review ? review.url : `https://www.ratemyprofessors.com/search/professors/1074?q=${name.replace(/,/g, '').replace(/\./g, '')}`;
    
    if (name === "STAFF") return <p>{name}</p>;
    return (
        <div className="relative" >
            <a 
                className="text-sky-500 underline" 
                href={rmp_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                onMouseEnter={()=>setReviewVisible(true)} 
                onMouseLeave={()=>setReviewVisible(false)}
            >{name}
                <br/>
            </a>
            <RateMyProfessorsReview review={review} visible={reviewVisible}/>
        </div>
    );
}