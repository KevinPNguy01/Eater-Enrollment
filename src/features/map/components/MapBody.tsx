import { buildingIds } from 'constants/BuildingIds';
import { buildings } from "constants/Buildings";
import { MapContainer, TileLayer } from 'react-leaflet';
import { CourseOffering } from 'types/CourseOffering';
import { CustomEvent } from 'types/CustomEvent';
import { EventMarker } from './EventMarker';

export function MapBody(props: { offerings: CourseOffering[], customEvents: CustomEvent[] }) {
    const { offerings, customEvents } = props;

    // Map lists of course offerings to building ids so that markers at the same location can be stacked.
    const buildingEvents = new Map<number, (CourseOffering | CustomEvent)[]>();
    offerings.forEach((offering) => {
        const id = offering.parsed_meetings[0].buildingId;
        if (!buildingEvents.has(id)) {
            buildingEvents.set(id, []);
        }
        buildingEvents.get(id)!.push(offering)
    });
    customEvents.forEach((customEvent) => {
        const id = buildingIds[customEvent.location];
        if (!buildingEvents.has(id)) {
            buildingEvents.set(id, []);
        }
        buildingEvents.get(id)!.push(customEvent)
    });
    // Create markers for each of the offerings.
    const markers = [...buildingEvents.entries()].filter(([id,]) => buildings[id]).map(([, events]) =>
        events.map((event, index) => {
            if ("course" in event) {
                const offering = event as CourseOffering;
                return <EventMarker
                    key={`${offering.quarter} ${offering.year} ${offering.section.code}`}
                    type={"CourseOffering"}
                    event={offering}
                    translate_y={events.length - index - 1}
                    color={event.color}
                />
            } else {
                const customEvent = event as CustomEvent;
                return <EventMarker
                    key={customEvent.id}
                    type={"CustomEvent"}
                    event={customEvent}
                    translate_y={events.length - index - 1}
                    color={event.color}
                />
            }
        })
    ).flat();

    return (
        <MapContainer center={[33.64606888579674, -117.84275910500428]} zoom={17} className="h-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://d32w28pcyzk3qf.cloudfront.net/{z}/{x}/{y}.png"
                tileSize={512}
                maxZoom={21}
                minZoom={15}
                zoomOffset={-1}
            />
            {markers}
        </MapContainer>
    )
}