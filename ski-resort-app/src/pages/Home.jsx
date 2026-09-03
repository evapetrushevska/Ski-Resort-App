import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <main className="home-page">
      <section className="hero">
        <h1>Welcome to the Ski Resort</h1>
        {user ? (
          <p>Welcome back, {user.firstName}! Ready to hit the slopes?</p>
        ) : (
          <p>Book your passes, lessons, and equipment all in one place.</p>
        )}
      </section>

      <section>
        <h2>What would you like to do?</h2>
        <ul className="quick-links">
          <li>
            <Link to="/slopes">Check Slopes & Weather</Link>
          </li>
          <li>
            <Link to="/equipment">Rent Equipment</Link>
          </li>
          {user && user.role === "visitor" && (
            <>
              <li>
                <Link to="/passes">Book a Ski Pass</Link>
              </li>
              <li>
                <Link to="/lessons">Book a Lesson</Link>
              </li>
            </>
          )}
          {user && user.role === "instructor" && (
            <li>
              <Link to="/lessons">View My Schedule</Link>
            </li>
          )}
          {!user && (
            <li>
              <Link to="/register">Create an Account</Link>
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}