import { useContext, useState } from 'react';
import { ScheduleContext } from '../App';
import { MapNavBar } from '../../features/map/components/MapNavBar';
import { MapBody } from '../../features/map/components/MapBody';

export function MapTab() {
    const [daysMask, setDaysMask] = useState(0b11111);
    const {addedCourses, scheduleIndex, colorRules} = useContext(ScheduleContext);
    const courses = addedCourses[scheduleIndex].courses;

    const offerings = courses.map(({offerings}) => offerings).flat();                                       // Flat list of course offerings.
    const offeringsToday = offerings.filter(({parsed_meetings}) => parsed_meetings[0].days & daysMask);     // Filter offerings for the day selected.

    return  (
        <div id="map" className="h-full mb-1">
            <MapNavBar activeDayState={[daysMask, setDaysMask]}/>
            <MapBody offerings={offeringsToday} colorRules={colorRules}/>
        </div>
    );
}