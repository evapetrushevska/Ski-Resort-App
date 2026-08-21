import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEquipment() {
      try {
        const res = await fetch(`${API_URL}/equipment`);
        const data = await res.json();
        setEquipment(data);
      } catch (err) {
        console.log("Error loading equipment:", err);
        setError("Could not load equipment.");
      }
    }
    loadEquipment();
  }, []);

  return (
    <main className="equipment-page">
      <h1>Equipment Rental</h1>
      {error && <p>{error}</p>}
      {equipment.length === 0 && !error && <p>No equipment available yet.</p>}
      <ul>
        {equipment.map((item) => (
          <li key={item.equipment_id}>
            <strong>{item.name}</strong> ({item.type}) - {item.availability_status}
          </li>
        ))}
      </ul>
    </main>
  );
}