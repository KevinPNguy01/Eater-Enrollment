import { Review } from "../../../constants/types";

/**
 * Preview of an instructor on RateMyProfessors.
 * @param review The review to render.
 * @param visible Whether to render this component.
 */
export function RateMyProfessorsReview(props: {review: Review, visible: boolean}) {
    const review = props.review;
    if (!review) return;
    return (
        <div className={`absolute left-full -translate-y-1/2 ${props.visible ? "block" : "hidden"} text-nowrap text-white text-left border border-quaternary bg-tertiary mx-4 p-4 z-20 w-fit`}>
            <div className="flex">
                <p className="text-4xl font-extrabold">{`${review.avgRating}`}</p>
                <p className="whitespace-pre text-gray-300 text-base font-bold">{` / 5`}</p>
            </div>
            <p className="text-sm font-bold">{`Overall Quality Based on ${review.numRatings} ratings.`}</p>
            <br/>
            <p className="text-4xl font-extrabold">{`${review.firstName} ${review.lastName}`}</p>
            <p className="text-base font-bold">{`${review.department}`}</p>
            <br/>
            <div className="flex justify-around">
                <div>
                    <p className="text-2xl font-extrabold">{`${review.wouldTakeAgainPercent.toFixed(0)}%`}</p>
                    <p className="text-sm font-bold">Would take again</p>
                </div>
                <div className="border mx-4"></div>
                <div>
                    <p className="text-2xl font-extrabold">{`${review.avgDifficulty.toFixed(1)}`}</p>
                    <p className="text-sm font-bold">Level of Difficulty</p>
                </div>
            </div>
        </div>
    );
}