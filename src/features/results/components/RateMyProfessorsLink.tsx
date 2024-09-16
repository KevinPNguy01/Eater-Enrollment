import Card from "@mui/material/Card";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectReviews } from "stores/selectors/Reviews";
import { Instructor } from "types/Instructor";
import { Review } from "types/Review";

/**
 * RateMyProfessors link tag for the given instructor, or a regular text tag if the instructor is STAFF.
 * Shows a preview of the instructor on RateMyProfessors on hover.
 * @param instructor The instructor to render the RateMyProfessors data for.
 */
export function RateMyProfessorsLink(props: { instructor: Instructor }) {
    const { shortened_name } = props.instructor;
    const [reviewVisible, setReviewVisible] = useState(false);
    const allReviews = useSelector(selectReviews);
    const review = allReviews[shortened_name];

    // If the instructor is STAFF, return regular text.
    if (shortened_name === "STAFF") {
        return <p>{shortened_name}</p>;
    }

    // If the instructor has a review on RMP, use that link. Otherwise, link to search for that instructor.
    const rmpLink = review ? review.url : `https://www.ratemyprofessors.com/search/professors/1074?q=${shortened_name.replace(/,/g, '').replace(/\./g, '')}`;

    return (
        <div className="relative" >
            {/** On click, open RMP in a new tab. On hover, set RMP info card visible. */}
            <a
                className="text-sky-500 underline"
                href={rmpLink}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setReviewVisible(true)}
                onMouseLeave={() => setReviewVisible(false)}
            >
                {shortened_name}
                <br />
            </a>

            {/** Display RMP info card if link is hovered over. */}
            {reviewVisible ? <RateMyProfessorsReview review={review} /> : null}
        </div>
    );
}

/**
 * Preview of an instructor on RateMyProfessors.
 * @param review The review to render.
 */
function RateMyProfessorsReview(props: { review: Review }) {
    // Return null if review doesn't exist.
    if (!props.review) {
        return null;
    }

    const { avgRating, numRatings, firstName, lastName, department, wouldTakeAgainPercent, avgDifficulty } = props.review;
    return (
        <Card elevation={3} className={`absolute left-full -translate-y-1/2 text-nowrap text-white text-left border border-quaternary bg-tertiary mx-6 p-6 z-10 w-fit`}>
            <div className="flex">
                <p className="text-4xl font-extrabold">{`${avgRating}`}</p>
                <p className="whitespace-pre text-gray-300 text-base font-bold">{` / 5`}</p>
            </div>
            <p className="text-sm font-bold">{`Overall Quality Based on ${numRatings} ratings.`}</p>
            <br />
            <p className="text-4xl font-extrabold">{`${firstName} ${lastName}`}</p>
            <p className="text-base font-bold">{`${department}`}</p>
            <br />
            <div className="flex justify-around">
                <div>
                    <p className="text-2xl font-extrabold">{`${wouldTakeAgainPercent.toFixed(0)}%`}</p>
                    <p className="text-sm font-bold">Would take again</p>
                </div>
                <div className="border mx-4"></div>
                <div>
                    <p className="text-2xl font-extrabold">{`${avgDifficulty.toFixed(1)}`}</p>
                    <p className="text-sm font-bold">Level of Difficulty</p>
                </div>
            </div>
        </Card>
    );
}