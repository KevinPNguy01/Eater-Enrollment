import { useContext } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { ScheduleContext } from '../App';
import { buildingIds } from '../../features/map/constants/BuildingIds';
import { buildings } from '../../features/map/constants/Buildings';
import { CourseOffering } from '../../constants/Types';
import { DivIcon } from 'leaflet';
import { getColor } from '../../utils/FullCalendar';

export function MapTab() {
    const {addedCourses, scheduleIndex, colorRules} = useContext(ScheduleContext);
    const courses = addedCourses[scheduleIndex].courses;
    const buildingOfferings = new Map<number, CourseOffering[]>();
    courses.map(({offerings}) => offerings).flat().forEach((offering) => {
        const location = offering.meetings[0].building
        const tokens = location.split(" ");
        const code = tokens.slice(0, -1).join(" ");
        //const number = tokens[tokens.length-1];
        const id = buildingIds[code];

        if (!buildingOfferings.has(id)) {
            buildingOfferings.set(id, []);
        }
        buildingOfferings.get(id)!.push(offering)
    });

    return  <div id="map" className="h-full mb-1 *:h-full">
        <MapContainer center={[33.64606888579674, -117.84275910500428]} zoom={17}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://d32w28pcyzk3qf.cloudfront.net/{z}/{x}/{y}{r}.png"
                tileSize={512}
                maxZoom={21}
                minZoom={15}
                zoomOffset={-1}
            />
            {[...buildingOfferings.entries()].map(([id, offerings]) => {
                const building = buildings[id];
                if (!building) return;
                const {lat, lng} = building;
                const shadowStyle = `text-shadow: ${"0 0 1px black,".repeat(16).slice(0,-1)}`;
                return offerings.map((offering, index) => {
                    const {backgroundColor: color} = getColor(offering, colorRules);
                    const {course, section} = offering
                    const marker = `
                        <div class="relative absolute left-1/2 bottom-0 group">
                            <div 
                                style="background-color: ${color}; translate: 0 -${(offerings.length-index-1)}rem" 
                                class="absolute border border-secondary w-6 h-6 rounded-full rounded-br-none rotate-45 -translate-x-1/2 bottom-0 group-hover:w-7 group-hover:h-7"
                            >
                            </div>
                            <span class="absolute font-extrabold group-hover:text-sm text-nowrap absolute left-0 -bottom-1/2 ml-5 text-white" style="${shadowStyle}; translate: 0 -${(offerings.length-index-1)}rem"
                            >${course.department} ${course.number} ${section.type}
                        </span>
                        </div>
                    `;
                    const markerIcon = new DivIcon({className:"", html: marker});
                    return (
                        <Marker position={[lat, lng]} icon={markerIcon}>
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
                }).flat();
            })}
        </MapContainer>
    </div>;
}