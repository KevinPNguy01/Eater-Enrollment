import {anteater} from "../assets";

const Navbar = () => (
  <nav className="bg-primary flex items-center">
      <img src={anteater} alt="Anteater Logo" className="w-[96px] h-[48px"/>
      <h1>
        Eater Enrollment
        </h1>
  </nav>
)

export default Navbar;