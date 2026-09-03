import { Link, useNavigate } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/slopes">Slopes</Link>
      <Link to="/equipment">Equipment</Link>

      {user && user.role === "visitor" && (
        <>
          <Link to="/passes">Passes</Link>
          <Link to="/lessons">Lessons</Link>
        </>
      )}

      {user && user.role === "instructor" && <Link to="/lessons">My Schedule</Link>}

      {user && user.role === "admin" && (
        <>
          <Link to="/lessons">All Lessons</Link>
          <Link to="/admin">Admin Dashboard</Link>
        </>
      )}

      {!user && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}

      {user && (
        <>
          <span>Hi, {user.firstName}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}