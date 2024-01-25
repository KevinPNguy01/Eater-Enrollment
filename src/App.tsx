import styles from './style';

import { NavBar, Hero, Courses } from './components';

const App = () => (
    <div className="h-screen overflow-hidden flex text-white flex-col">
      <NavBar/>
      <div id="main" className={`h-1 grow bg-secondary grid grid-cols-2`}>
        <Hero/>
        <Courses/>
      </div>
    </div>
);

export default App