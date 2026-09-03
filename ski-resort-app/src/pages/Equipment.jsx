import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const availableEquipment = equipment.filter(
    (item) => item.availability_status === "available"
  );

  const handleAuthExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMessage("Your session expired. Please log in again.");
    setMessageType("error");
    setTimeout(() => navigate("/login"), 1200);
  };

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
      if (res.status === 403) {
        handleAuthExpired();
        return;
      }
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
    setFieldErrors({});

    const errors = {};
    if (!newName.trim()) errors.newName = "Equipment name is required.";
    if (!newType.trim()) errors.newType = "Type is required.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessage("Please fix the highlighted fields.");
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

      if (res.status === 403) {
        handleAuthExpired();
        return;
      }

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
    setFieldErrors({});

    if (!token) {
      setMessage("Please log in to rent equipment.");
      setMessageType("error");
      return;
    }

    const errors = {};
    if (!rentalDate) errors.rentalDate = "Please choose a rental date.";
    if (!returnDate) errors.returnDate = "Please choose a return date.";
    if (rentalDate && returnDate && returnDate < rentalDate) {
      errors.returnDate = "Return date cannot be before the rental date.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessage("Please fix the highlighted fields.");
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

      if (res.status === 403) {
        handleAuthExpired();
        return;
      }

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

      if (res.status === 403) {
        handleAuthExpired();
        return;
      }

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
          <form onSubmit={handleAddEquipment} noValidate>
            <div className="field">
              <label>Name *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={fieldErrors.newName ? "input-error" : ""}
              />
              {fieldErrors.newName && <p className="field-error">{fieldErrors.newName}</p>}
            </div>
            <div className="field">
              <label>Type *</label>
              <input
                type="text"
                placeholder="e.g. skis, boots, helmet"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className={fieldErrors.newType ? "input-error" : ""}
              />
              {fieldErrors.newType && <p className="field-error">{fieldErrors.newType}</p>}
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
        <h2>{isAdmin ? "All Equipment" : "Available Equipment"}</h2>
        {isAdmin ? (
          <>
            {equipment.length === 0 && !error && <p>No equipment added yet.</p>}
            <ul>
              {equipment.map((item) => (
                <li key={item.equipment_id}>
                  <strong>{item.equipment_name}</strong> ({item.type}) - {item.availability_status}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            {availableEquipment.length === 0 && !error && <p>No equipment available right now.</p>}
            <ul>
              {availableEquipment.map((item) => (
                <li key={item.equipment_id}>
                  <strong>{item.equipment_name}</strong> ({item.type}){" "}
                  {token && (
                    <button onClick={() => handleRent(item.equipment_id)}>Rent</button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
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