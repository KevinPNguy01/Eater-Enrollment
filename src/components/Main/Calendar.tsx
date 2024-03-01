import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'

export function Calendar() {
	return (
		<div id="calendar" className={`flex flex-col`}>
			<FullCalendar 
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
			/>
		</div>
	)

}