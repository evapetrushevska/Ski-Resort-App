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
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [newName, setNewName] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("easy");

  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.role === "admin";

  const loadSlopes = async () => {
    try {
      const res = await fetch(`${API_URL}/slopes`);
      const data = await res.json();
      setSlopes(data);
    } catch (err) {
      console.log("Error loading slopes:", err);
      setError("Could not load slopes.");
    }
  };

  useEffect(() => {
    loadSlopes();
  }, []);

  const handleAddSlope = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!newName.trim()) {
      setMessage("Please enter a slope name.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/slopes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slopeName: newName, difficulty: newDifficulty }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Slope added.");
        setNewName("");
        loadSlopes();
      } else {
        setMessage("Could not add slope.");
      }
    } catch (err) {
      console.log("Add slope error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleToggleStatus = async (slope) => {
    setMessage("");
    const newStatus = slope.status === "open" ? "closed" : "open";
    try {
      const res = await fetch(`${API_URL}/slopes/${slope.slope_id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        loadSlopes();
      } else {
        setMessage("Could not update slope status.");
      }
    } catch (err) {
      console.log("Update status error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const filteredSlopes =
    filter === "all" ? slopes : slopes.filter((slope) => slope.difficulty === filter);

  return (
    <main className="slopes-page">
      <h1>Slopes</h1>

      {isAdmin && (
        <section>
          <h2>Add a Slope</h2>
          <form onSubmit={handleAddSlope}>
            <div>
              <label>Slope name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label>Difficulty</label>
              <select value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <button type="submit">Add Slope</button>
          </form>
        </section>
      )}

      {message && <p>{message}</p>}

      <section>
        <label>Filter by difficulty</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="expert">Expert</option>
        </select>
      </section>

      <section>
        {error && <p>{error}</p>}
        {filteredSlopes.length === 0 && !error && <p>No slopes match this filter.</p>}
        <ul>
          {filteredSlopes.map((slope) => (
            <li key={slope.slope_id}>
              <span>
                <strong>{slope.slope_name}</strong> ({slope.difficulty})
                {slope.temperature !== null && (
                  <span> — {slope.temperature}°C, {slope.condition}</span>
                )}
              </span>
              <span className={statusClass(slope.status)}>{slope.status}</span>
              {isAdmin && (
                <button onClick={() => handleToggleStatus(slope)}>
                  Mark as {slope.status === "open" ? "Closed" : "Open"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}