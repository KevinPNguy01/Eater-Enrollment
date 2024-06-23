import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useContext, useState } from 'react';
import { AddedCoursesContext, ScheduleContext } from './App';
import { CourseOffering } from '../../constants/types';

export function Calendar() {
	const [offering, setOffering] = useState(null as unknown as CourseOffering);
	const [pos, setPos] = useState({x: 0, y: 0});
	const { calendarReference, removeOffering } = useContext(ScheduleContext);
	const addedCourses = useContext(AddedCoursesContext);
	return (
		<div id="calendar" className={`flex flex-col`}>
			<FullCalendar 
				ref={calendarReference}
				plugins={[ timeGridPlugin ]}
				initialView="timeGridWeek"
				headerToolbar={false}
				weekends={false}
				allDaySlot={false}
				height="100%"
				expandRows={true}
				slotMinTime="07:00:00"
				slotMaxTime="23:00:00"
				slotLabelFormat={{
				hour: "numeric"
				}}
				dayHeaderFormat={{ weekday: 'short' }}
				eventBorderColor="#00000080"
				eventClick={(info) => {
					setPos(({x: info.el.getBoundingClientRect().left + info.el.getBoundingClientRect().width + 5, y: info.el.getBoundingClientRect().top}));
					const clickedOffering = addedCourses.map((course) => course.offerings).flat().find((offering) => offering.section.code === info.event.id.split("-")[0])!
					if (clickedOffering == offering) {
						setOffering(null as unknown as CourseOffering);
					} else {
						setOffering(clickedOffering);
					}
				}}
			/>
			{offering ? (<div className="absolute bg-tertiary p-2 border border-quaternary z-10 event-info" style={{top: `${pos.y}px`, left: `${pos.x}px`}}>
				<table>
					<tbody>
						<tr>
							<td>
								{`${offering.course.department} ${offering.course.number} ${offering.section.type}`}
							</td>
							<td>
								<button onClick={() => {
									removeOffering(offering);
									setOffering(null as unknown as CourseOffering);
								}}>
									🗑
								</button>
							</td>
						</tr>
						<tr>
							<td className="whitespace-pre">{"Instructors\t\t"}</td>
							<td>
								{offering.instructors.map(
									(instructor) => {
										const name = instructor.shortened_name;
										const rmp_link = `https://www.ratemyprofessors.com/search/professors/1074?q=${name.split(",")[0]}`
										if (name === "STAFF") return (<p>{name+"\n"}</p>)
										return (<a href={rmp_link} target="_blank" rel="noopener noreferrer" className="text-sky-500 underline">{name+"\n"}</a>)
									}
								)}
							</td>
						</tr>
						<tr>
							<td>Capacity</td>
							<td>{`${offering.num_total_enrolled}/${offering.max_capacity}`}</td>
						</tr>
						<tr>
							<td>Status</td>
							<td>{offering.status}</td>
						</tr>
						<tr>
							<td>Code</td>
							<td>
								{offering.section.code}
							</td>
						</tr>
					</tbody>
				</table>
			</div>) : null}
		</div>
	)

}