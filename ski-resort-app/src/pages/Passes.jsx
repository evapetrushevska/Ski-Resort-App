import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

const PASS_OPTIONS = [
  { type: "1-Day Pass (Adult)", price: 40 },
  { type: "1-Day Pass (Kids)", price: 25 },
  { type: "Weekend Pass (Adult)", price: 90 },
  { type: "Weekend Pass (Kids)", price: 55 },
  { type: "Season Pass (Adult)", price: 400 },
  { type: "Season Pass (Kids)", price: 250 },
];

export default function Passes() {
  const [myPasses, setMyPasses] = useState([]);
  const [message, setMessage] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");

  const token = localStorage.getItem("token");

  const loadMyPasses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/passes/my`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMyPasses(data);
      }
    } catch (err) {
      console.log("Error loading passes:", err);
    }
  };

  useEffect(() => {
    loadMyPasses();
  }, []);

  const handleBook = async (type, price) => {
    setMessage("");

    if (!token) {
      setMessage("Please log in to book a pass.");
      return;
    }

    if (!validFrom || !validTo) {
      setMessage("Please choose valid from and valid to dates.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/passes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, price, validFrom, validTo }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Pass booked successfully.");
        loadMyPasses();
      } else {
        setMessage("Booking failed.");
      }
    } catch (err) {
      console.log("Booking error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleCancel = async (passId) => {
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/passes/${passId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Pass cancelled.");
        loadMyPasses();
      } else {
        setMessage("Cancel failed.");
      }
    } catch (err) {
      console.log("Cancel error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="passes-page">
      <h1>Ski Pass Booking</h1>

      {!token && <p>Please log in to book a ski pass.</p>}

      {token && (
        <>
          <section>
            <h2>Choose your dates</h2>
            <div>
              <label>Valid from</label>
              <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </div>
            <div>
              <label>Valid to</label>
              <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
            </div>
          </section>

          <section>
            <h2>Available Passes</h2>
            <ul>
              {PASS_OPTIONS.map((option) => (
                <li key={option.type}>
                  {option.type} - ${option.price}{" "}
                  <button onClick={() => handleBook(option.type, option.price)}>Book</button>
                </li>
              ))}
            </ul>
          </section>

          {message && <p>{message}</p>}

          <section>
            <h2>My Passes</h2>
            {myPasses.length === 0 && <p>You have no passes yet.</p>}
            <ul>
              {myPasses.map((pass) => (
                <li key={pass.pass_id}>
                  {pass.type} - ${pass.price} ({pass.valid_from} to {pass.valid_to}) - {pass.booking_status}{" "}
                  {pass.booking_status !== "cancelled" && (
                    <button onClick={() => handleCancel(pass.pass_id)}>Cancel</button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}