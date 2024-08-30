import { MapContainer, TileLayer } from 'react-leaflet'
import { CourseOffering } from "../../../constants/Types";
import { buildings } from "../constants/Buildings";
import { OfferingMarker } from './OfferingMarker';

export function MapBody(props: {offerings: CourseOffering[]}) {
    const {offerings} = props;

    // Map lists of course offerings to building ids so that markers at the same location can be stacked.
    const buildingOfferings = new Map<number, CourseOffering[]>();
    offerings.forEach((offering) => { 
        const id = offering.parsed_meetings[0].buildingId;
        if (!buildingOfferings.has(id)) {
            buildingOfferings.set(id, []);
        }
        buildingOfferings.get(id)!.push(offering)
    });

    // Create markers for each of the offerings.
    const markers = [...buildingOfferings.entries()].filter(([id,]) => buildings[id]).map(([, offerings]) => 
        offerings.map((offering, index) => 
            <OfferingMarker offering={offering} translate_y={offerings.length-index-1} color={offering.color}/>
        )
    ).flat();

    return (
        <MapContainer center={[33.64606888579674, -117.84275910500428]} zoom={17} className="h-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://d32w28pcyzk3qf.cloudfront.net/{z}/{x}/{y}{r}.png"
                tileSize={512}
                maxZoom={21}
                minZoom={15}
                zoomOffset={-1}
            />
            {markers}
        </MapContainer>
    )
}