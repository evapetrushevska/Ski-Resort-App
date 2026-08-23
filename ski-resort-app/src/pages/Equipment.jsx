import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rentalDate, setRentalDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const token = localStorage.getItem("token");

  const loadEquipment = async () => {
    try {
      const res = await fetch(`${API_URL}/equipment`);
      const data = await res.json();
      setEquipment(data);
    } catch (err) {
      console.log("Error loading equipment:", err);
      setError("Could not load equipment.");
    }
  };

  const loadMyRentals = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/rentals/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMyRentals(data);
      }
    } catch (err) {
      console.log("Error loading rentals:", err);
    }
  };

  useEffect(() => {
    loadEquipment();
    loadMyRentals();
  }, []);

  const handleRentalDate = (value) => {
    setRentalDate(value);
    if (returnDate && value && returnDate < value) {
      setReturnDate("");
    }
  };

  const handleRent = async (equipmentId) => {
    setMessage("");

    if (!token) {
      setMessage("Please log in to rent equipment.");
      return;
    }

    if (!rentalDate || !returnDate) {
      setMessage("Please choose a rental date and return date.");
      return;
    }

    if (returnDate < rentalDate) {
      setMessage("Return date cannot be before the rental date.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ equipmentId, rentalDate, returnDate }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Equipment rented successfully.");
        loadMyRentals();
      } else {
        setMessage("Rental failed.");
      }
    } catch (err) {
      console.log("Rental error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleCancel = async (rentalId) => {
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/rentals/${rentalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Rental cancelled.");
        loadMyRentals();
      } else {
        setMessage("Cancel failed.");
      }
    } catch (err) {
      console.log("Cancel error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="equipment-page">
      <h1>Equipment Rental</h1>
      {error && <p>{error}</p>}

      {token && (
        <section>
          <h2>Choose your dates</h2>
          <div>
            <label>Rental date</label>
            <input
              type="date"
              value={rentalDate}
              onChange={(e) => handleRentalDate(e.target.value)}
            />
          </div>
          <div>
            <label>Return date</label>
            <input
              type="date"
              value={returnDate}
              min={rentalDate || undefined}
              disabled={!rentalDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>
        </section>
      )}

      <section>
        <h2>Available Equipment</h2>
        {equipment.length === 0 && !error && <p>No equipment available yet.</p>}
        <ul>
          {equipment.map((item) => (
            <li key={item.equipment_id}>
              <strong>{item.equipment_name}</strong> ({item.type}) - {item.availability_status}{" "}
              {token && item.availability_status === "available" && (
                <button onClick={() => handleRent(item.equipment_id)}>Rent</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {message && <p>{message}</p>}

      {token && (
        <section>
          <h2>My Rentals</h2>
          {myRentals.length === 0 && <p>You have no rentals yet.</p>}
          <ul>
            {myRentals.map((rental) => (
              <li key={rental.rental_id}>
                {rental.equipment_name} ({rental.rental_date} to {rental.return_date}) - {rental.booking_status}{" "}
                {rental.booking_status !== "cancelled" && (
                  <button onClick={() => handleCancel(rental.rental_id)}>Cancel</button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!token && <p>Log in to rent equipment.</p>}
    </main>
  );
}