import { MapBody } from 'features/map/components/MapBody';
import { MapNavBar } from 'features/map/components/MapNavBar';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentSchedule } from 'stores/selectors/ScheduleSetSelectors';

export function MapTab() {
    const schedule = useSelector(selectCurrentSchedule);
    const [daysMask, setDaysMask] = useState(0b11111);
    const courses = schedule.courses;

    const offerings = courses.map(({ offerings }) => offerings).flat();                                       // Flat list of course offerings.
    const offeringsToday = offerings.filter(({ parsed_meetings }) => parsed_meetings[0].days & daysMask);     // Filter offerings for the day selected.
    const customEventsToday = schedule.customEvents.filter(({ days }) => days & daysMask)

    return (
        <div id="map" className="h-full mb-1 relative">
            <MapNavBar activeDayState={[daysMask, setDaysMask]} />
            <MapBody offerings={offeringsToday} customEvents={customEventsToday} />
        </div>
    );
}