import { DivIcon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { buildings } from "../constants/Buildings";
import { CourseOffering } from "../../../types/CourseOffering";

const shadowStyle = `text-shadow: ${"0 0 1px black,".repeat(16).slice(0,-1)}`;

export function OfferingMarker(props: {offering: CourseOffering, translate_y: number, color: string}) {
    const {offering, translate_y, color} = props;
    const {course, section} = offering
    const building = buildings[offering.parsed_meetings[0].buildingId];

    // Create and style div to act as marker icon.
    const marker = `
        <div class="relative absolute left-1/2 bottom-0 group">
            <div 
                style="background-color: ${color}; translate: 0 -${translate_y}rem" 
                class="absolute border border-secondary w-6 h-6 rounded-full rounded-br-none rotate-45 -translate-x-1/2 bottom-0 group-hover:w-7 group-hover:h-7"
            >
            </div>
            <span 
                class="absolute font-extrabold group-hover:text-sm text-nowrap absolute left-0 -bottom-1/2 ml-5 text-white" 
                style="${shadowStyle}; translate: 0 -${translate_y}rem"
            >
                ${course.department} ${course.number} ${section.type}
            </span>
        </div>
    `;
    const markerIcon = new DivIcon({className:"", html: marker});

    return (
        <Marker position={[building.lat, building.lng]} icon={markerIcon}>
            <Popup>
                <div className="flex flex-col gap-1">
                    <h1 className="text-black">{course.department} {course.number} {section.type}</h1>
                    <span className="text-lg font-bold">{offering.meetings[0].days} {offering.meetings[0].time}</span>
                    {building.imageURLs.length ? <img src={"https://cms.concept3d.com/map/lib/image-cache/i.php?mapId=463&image=" + building.imageURLs[0]}/> : null}
                    <span className="text-lg font-bold">{building.name}</span>
                </div>
            </Popup>
        </Marker>
    )
}