import { useState } from 'react';
import { MapNavBar } from '../../features/map/components/MapNavBar';
import { MapBody } from '../../features/map/components/MapBody';
import { useSelector } from 'react-redux';
import { selectCurrentSchedule } from '../../features/schedules/selectors/ScheduleSetSelectors';

export function MapTab() {
    const schedule = useSelector(selectCurrentSchedule);
    const [daysMask, setDaysMask] = useState(0b11111);
    const courses = schedule.courses;

    const offerings = courses.map(({offerings}) => offerings).flat();                                       // Flat list of course offerings.
    const offeringsToday = offerings.filter(({parsed_meetings}) => parsed_meetings[0].days & daysMask);     // Filter offerings for the day selected.

    return  (
        <div id="map" className="h-full mb-1 relative">
            <MapNavBar activeDayState={[daysMask, setDaysMask]}/>
            <MapBody offerings={offeringsToday}/>
        </div>
    );
}