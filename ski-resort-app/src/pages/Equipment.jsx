import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return day + " " + month + " " + year;
}

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [rentalDate, setRentalDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");

  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.role === "admin";

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
    if (!token || isAdmin) return;
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

  const handleAddEquipment = async (event) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!newName.trim() || !newType.trim()) {
      setMessage("Please fill in the equipment name and type.");
      setMessageType("error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, type: newType }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Equipment added and marked available for rental.");
        setMessageType("success");
        setNewName("");
        setNewType("");
        loadEquipment();
      } else {
        setMessage("Could not add equipment.");
        setMessageType("error");
      }
    } catch (err) {
      console.log("Add equipment error:", err);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    }
  };

  const handleRentalDateChange = (value) => {
    setRentalDate(value);
    if (returnDate && value && returnDate < value) {
      setReturnDate("");
    }
  };

  const handleRent = async (equipmentId) => {
    setMessage("");
    setMessageType("");

    const errors = {};
    if (!token) {
      setMessage("Please log in to rent equipment.");
      setMessageType("error");
      return;
    }
    if (!rentalDate) errors.rentalDate = "Please choose a rental date.";
    if (!returnDate) errors.returnDate = "Please choose a return date.";
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("Please fix the highlighted fields.");
      setMessageType("error");
      return;
    }

    if (returnDate < rentalDate) {
      setMessage("Return date cannot be before the rental date.");
      setMessageType("error");
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
        setMessageType("success");
        setFieldErrors({});
        loadMyRentals();
        loadEquipment();
      } else {
        setMessage("Rental failed.");
        setMessageType("error");
      }
    } catch (err) {
      console.log("Rental error:", err);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    }
  };

  const handleCancel = async (rentalId) => {
    setMessage("");
    setMessageType("");
    try {
      const res = await fetch(`${API_URL}/rentals/${rentalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Rental cancelled.");
        setMessageType("success");
        loadMyRentals();
        loadEquipment();
      } else {
        setMessage("Cancel failed.");
        setMessageType("error");
      }
    } catch (err) {
      console.log("Cancel error:", err);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <main className="equipment-page">
      <h1>Equipment Rental</h1>
      {error && <p className="form-message error">{error}</p>}

      {isAdmin && (
        <section>
          <h2>Add Equipment</h2>
          <form onSubmit={handleAddEquipment}>
            <div>
              <label>Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label>Type</label>
              <input type="text" placeholder="e.g. skis, boots, helmet" value={newType} onChange={(e) => setNewType(e.target.value)} />
            </div>
            <button type="submit">Add Equipment</button>
          </form>
        </section>
      )}

      {!isAdmin && token && (
        <section>
          <h2>Choose your dates</h2>
          <div className="field">
            <label>Rental date</label>
            <input
              type="date"
              value={rentalDate}
              onChange={(e) => handleRentalDateChange(e.target.value)}
              className={fieldErrors.rentalDate ? "input-error" : ""}
            />
            {fieldErrors.rentalDate && <p className="field-error">{fieldErrors.rentalDate}</p>}
          </div>
          <div className="field">
            <label>Return date</label>
            <input
              type="date"
              value={returnDate}
              min={rentalDate || undefined}
              disabled={!rentalDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={fieldErrors.returnDate ? "input-error" : ""}
            />
            {fieldErrors.returnDate && <p className="field-error">{fieldErrors.returnDate}</p>}
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
              {!isAdmin && token && item.availability_status === "available" && (
                <button onClick={() => handleRent(item.equipment_id)}>Rent</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {message && <p className={`form-message ${messageType}`}>{message}</p>}

      {!isAdmin && token && (
        <section>
          <h2>My Rentals</h2>
          {myRentals.length === 0 && <p>You have no rentals yet.</p>}
          <ul>
            {myRentals.map((rental) => (
              <li key={rental.rental_id}>
                {rental.equipment_name} ({formatDate(rental.rental_date)} to {formatDate(rental.return_date)}) -{" "}
                {rental.booking_status}{" "}
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