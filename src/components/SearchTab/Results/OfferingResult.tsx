import { useContext, useState } from 'react';
import { Course, CourseOffering, Instructor, Review } from '../../../constants/types'
import { ScheduleContext } from '../../Main/App';

// Define colors for various keywords.
const statusColors = new Map([
    ["OPEN", "text-green-500"],
    ["NewOnly", "text-cyan-500"],
    ["Waitl", "text-blue-500"],
    ["FULL", "text-red-500"]
]);
const typeColors = new Map([
    ["Lec", "text-red-500"],
    ["Dis", "text-orange-500"],
    ["Lab", "text-cyan-500"],
    ["Sem", "text-blue-500"],
    ["Stu", "text-green-500"],
    ["Fld", "text-green-500"],
    ["Tut", "text-yellow-500"],
    ["Tap", "text-yellow-500"],
    ["Res", "text-rose-500"],
    ["Col", "text-rose-500"],
    ["Act", "text-indigo-500"],
    ["Qiz", "text-indigo-500"]
]);

/**
 * Component for displaying a course result as a tr, to be used in CourseResult.
 */
export function OfferingResult(props: {offering: CourseOffering}) {
    const offering = props.offering
    const course = offering.course;

    return (
        <tr className="course-result odd:bg-quaternary even:bg-tertiary" key={offering.section.code}>
            <td><CourseCheckBox course={course} offering={offering}/></td>
            <td>{offering.section.code}</td>
            <td className={`${typeColors.get(offering.section.type)}`}>{offering.section.type}</td>
            <td>{offering.instructors.map(instructor => <RateMyProfessorsLink key={instructor.shortened_name} instructor={instructor} review={instructor.review}/>)}</td>
            <td>{offering.gpa ? (Math.round((offering.gpa + Number.EPSILON) * 100) / 100).toFixed(2) : ""}</td>
            <td>{`${offering.meetings[0].days} ${offering.meetings[0].time}`}</td>
            <td>{offering.meetings[0].building}</td>
            <td>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</td>
            <td className={`${statusColors.get(offering.status)}`}>{offering.status}</td>
            <td>{offering.restrictions}</td>
        </tr>)
}

/**
 * Checkbox for adding and removing a CourseOffering, to be used in OfferingResult.
 */
function CourseCheckBox(props: {course: Course, offering: CourseOffering}) {
    const { addOffering, removeOffering, containsOffering } = useContext(ScheduleContext);
    const offering = props.offering;

    // Add or remove offering depending on the box was checked or unchecked.
    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        (event.target.checked ? addOffering : removeOffering)(offering);
    };

    return (
        <input 
            type="checkbox"
            onChange={handleCheckBoxChange}
            className={`checkbox-${offering.course.id}-${offering.section.code}`}
            defaultChecked={containsOffering(offering)}
        />
    )
}

/**
 * RateMyProfessors link tag for the given instructor, or a regular text tag if the instructor is STAFF.
 */
function RateMyProfessorsLink(props: {instructor: Instructor, review: Review}) {
    const [reviewVisible, setReviewVisible] = useState(false);

    const name = props.instructor.shortened_name;
    const review = props.review;
    if (name === "STAFF") return <p>{name}</p>;
    const rmp_link = review ? review.url : `https://www.ratemyprofessors.com/search/professors/1074?q=${name.replace(/,/g, '').replace(/\./g, '')}`;
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

function RateMyProfessorsReview(props: {review: Review, visible: boolean}) {
    const review = props.review;
    if (!review) {
        return;
    }
    return (
        <div className={`absolute left-full -translate-y-1/2 ${props.visible ? "block" : "hidden"} text-nowrap text-white text-left border border-quaternary bg-tertiary m-2 p-4 z-20 w-fit`}>
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
    )
}