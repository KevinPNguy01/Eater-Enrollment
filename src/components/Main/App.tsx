import { NavBar, Calendar, Courses } from '..';

// Navigation bar with calendar on the left, and everything else on the right.
const App = () => (
    <div className="h-screen overflow-hidden flex text-white flex-col">
      <NavBar/>
      <div id="main" className={`h-1 grow bg-secondary grid grid-cols-2`}>
        <Calendar/>
        <Courses/>
      </div>
    </div>
);

export default App