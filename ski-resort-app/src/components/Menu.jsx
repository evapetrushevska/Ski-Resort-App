import { Link } from "react-router-dom";

export default function Menu() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
      <Link to="/slopes">Slopes</Link>
      <Link to="/equipment">Equipment</Link>
      <Link to="/passes">Passes</Link>
    </nav>
  );
}