import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

function statusClass(status) {
  if (status === "open") return "status status-good";
  if (status === "closed") return "status status-bad";
  return "status status-neutral";
}

export default function Slopes() {
  const [slopes, setSlopes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSlopes() {
      try {
        const res = await fetch(`${API_URL}/slopes`);
        const data = await res.json();
        setSlopes(data);
      } catch (err) {
        console.log("Error loading slopes:", err);
        setError("Could not load slopes.");
      }
    }
    loadSlopes();
  }, []);

  return (
    <main className="slopes-page">
      <h1>Slopes & Weather</h1>
      <section>
        {error && <p>{error}</p>}
        {slopes.length === 0 && !error && <p>No slopes available yet.</p>}
        <ul>
          {slopes.map((slope) => (
            <li key={slope.slope_id}>
              <span>
                <strong>{slope.slope_name}</strong> ({slope.difficulty})
                {slope.temperature !== null && (
                  <span> — {slope.temperature}°C, {slope.condition}</span>
                )}
              </span>
              <span className={statusClass(slope.status)}>{slope.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}