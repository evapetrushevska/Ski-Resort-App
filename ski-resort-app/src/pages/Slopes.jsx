import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

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
      {error && <p>{error}</p>}
      {slopes.length === 0 && !error && <p>No slopes available yet.</p>}
      <ul>
        {slopes.map((slope) => (
          <li key={slope.slope_id}>
            <strong>{slope.slope_name}</strong> ({slope.difficulty}) - {slope.status}
            {slope.temperature !== null && (
              <span> | {slope.temperature}°C, {slope.condition}</span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}