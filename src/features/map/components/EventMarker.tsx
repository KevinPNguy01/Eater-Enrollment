import { DivIcon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { buildings } from "../constants/Buildings";
import { CourseOffering } from "../../../types/CourseOffering";
import { CustomEvent } from "../../../types/CustomEvent";
import { buildingIds } from "../constants/BuildingIds";
import moment from "moment";

const shadowStyle = `text-shadow: ${"0 0 1px black,".repeat(16).slice(0,-1)}`;

export function EventMarker(props: {type: "CourseOffering" | "CustomEvent", event: CourseOffering | CustomEvent, translate_y: number, color: string}) {
    const {type, event, translate_y, color} = props;
    const offering = type === "CourseOffering" ? event as CourseOffering : null;
    const customEvent = type === "CustomEvent" ? event as CustomEvent : null;

    const title = offering ? `${offering.course.department} ${offering.course.number} ${offering.section.type}` : customEvent!.title;
    const building = offering ? buildings[offering.parsed_meetings[0].buildingId]: buildings[buildingIds[customEvent!.location]];
    const {startTime, endTime, days} = offering ? offering.parsed_meetings[0] : customEvent!;
    const daysString = ["Su","M", "Tu", "W", "Th", "F", "Sa"].filter((_, i) => days & (1 << (6-i))).join("");
    const startString = moment(startTime, "hh:mm A").format("h:mm");

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
                ${offering ? `${offering.course.department} ${offering.course.number} ${offering.section.type}` : customEvent!.title}
            </span>
        </div>
    `;
    const markerIcon = new DivIcon({className:"", html: marker});

    return (
        <Marker position={[building.lat, building.lng]} icon={markerIcon}>
            <Popup>
                <div className="flex flex-col gap-1">
                    <h1 className="text-black">{title}</h1>
                    <span className="text-lg font-bold">{daysString} {startString} - {endTime}</span>
                    {building.imageURLs.length ? <img src={"https://cms.concept3d.com/map/lib/image-cache/i.php?mapId=463&image=" + building.imageURLs[0]}/> : null}
                    <span className="text-lg font-bold">{building.name}</span>
                </div>
            </Popup>
        </Marker>
    )
}