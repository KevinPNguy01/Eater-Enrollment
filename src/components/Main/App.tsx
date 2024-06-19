import { MutableRefObject, createContext, useRef } from 'react';
import { NavBar, Calendar, Courses } from '..';
import { Course } from '../../constants/types';

// Context provider for saving the courses and course offerings added.
export const AddedCoursesContext = createContext([] as Course[])

// Context provider for accessing the calendar element.
export const CalendarContext = createContext(null as unknown as MutableRefObject<null>);

// Navigation bar with calendar on the left, and everything else on the right.
function App() {
  const calendarRef = useRef(null);
  return (
    <CalendarContext.Provider value={calendarRef}>
      <div className="h-screen overflow-hidden flex text-white flex-col">
        <NavBar/>
        <div id="main" className={`h-1 grow bg-secondary grid grid-cols-2`}>
          <Calendar/>
          <Courses/>
        </div>
      </div>
    </CalendarContext.Provider>
  )
}

export default App