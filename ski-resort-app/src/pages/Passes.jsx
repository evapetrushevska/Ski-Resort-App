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

const PRICE_LIST = [
  { label: "1-Day Pass", adult: 40, kids: 25 },
  { label: "Weekend Pass (2-6 days)", adult: 90, kids: 55 },
  { label: "Season Pass (7+ days)", adult: 400, kids: 250 },
];

function getDurationDays(validFrom, validTo) {
  const from = new Date(validFrom);
  const to = new Date(validTo);
  const diffTime = to - from;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

function getPassForDuration(days) {
  if (days <= 1) return PRICE_LIST[0];
  if (days <= 6) return PRICE_LIST[1];
  return PRICE_LIST[2];
}

export default function Passes() {
  const [myPasses, setMyPasses] = useState([]);
  const [message, setMessage] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [ageGroup, setAgeGroup] = useState("adult");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const loadMyPasses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/passes/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMyPasses(data);
    } catch (err) {
      console.log("Error loading passes:", err);
    }
  };

  useEffect(() => {
    loadMyPasses();
  }, []);

  const handleValidFromChange = (value) => {
    setValidFrom(value);
    if (validTo && value && validTo < value) {
      setValidTo("");
    }
  };

  const isInstructor = user && user.role === "instructor";
  const days = validFrom && validTo ? getDurationDays(validFrom, validTo) : null;
  const matchedPass = days ? getPassForDuration(days) : null;
  const price = matchedPass ? (ageGroup === "kids" ? matchedPass.kids : matchedPass.adult) : null;

  const handlePay = async (event) => {
    event.preventDefault();
    setMessage("");

    const errors = {};
    if (!validFrom) errors.validFrom = "Please choose a start date.";
    if (!validTo) errors.validTo = "Please choose an end date.";
    if (!cardName.trim()) errors.cardName = "Name on card is required.";
    if (!cardNumber.trim()) errors.cardNumber = "Card number is required.";
    if (!cardExpiry.trim()) errors.cardExpiry = "Expiry is required.";
    if (!cardCvc.trim()) errors.cardCvc = "CVC is required.";
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("Please fix the highlighted fields.");
      return;
    }

    if (validTo < validFrom) {
      setMessage("Valid to date cannot be before the valid from date.");
      return;
    }

    const passType = `${matchedPass.label} (${ageGroup === "kids" ? "Kids" : "Adult"})`;

    try {
      const res = await fetch(`${API_URL}/passes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: passType, price, validFrom, validTo }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Payment successful. Pass booked.");
        setValidFrom("");
        setValidTo("");
        setCardName("");
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
        setFieldErrors({});
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
        headers: { Authorization: `Bearer ${token}` },
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

      <section>
        <h2>Price List</h2>
        <div className="price-grid">
          {PRICE_LIST.map((item) => (
            <div className="price-card" key={item.label}>
              <h3>{item.label}</h3>
              <p>Adult: ${item.adult}</p>
              {!isInstructor && <p>Kids: ${item.kids}</p>}
            </div>
          ))}
        </div>
      </section>

      {!token && <p>Please log in to book a ski pass.</p>}

      {token && (
        <>
          <section>
            <h2>Choose your dates</h2>
            <div className="field">
              <label>Valid from</label>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => handleValidFromChange(e.target.value)}
                className={fieldErrors.validFrom ? "input-error" : ""}
              />
              {fieldErrors.validFrom && <p className="field-error">{fieldErrors.validFrom}</p>}
            </div>
            <div className="field">
              <label>Valid to</label>
              <input
                type="date"
                value={validTo}
                min={validFrom || undefined}
                disabled={!validFrom}
                onChange={(e) => setValidTo(e.target.value)}
                className={fieldErrors.validTo ? "input-error" : ""}
              />
              {fieldErrors.validTo && <p className="field-error">{fieldErrors.validTo}</p>}
            </div>

            {!isInstructor && (
              <div className="field">
                <label>Age group</label>
                <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
                  <option value="adult">Adult</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
            )}
          </section>

          {matchedPass && (
            <section>
              <h2>Selected Pass</h2>
              <p>
                {matchedPass.label} ({days} day{days > 1 ? "s" : ""}) - {ageGroup === "kids" ? "Kids" : "Adult"} - $
                {price}
              </p>

              <h2>Payment Details</h2>
              <form onSubmit={handlePay}>
                <div className="field">
                  <label>Name on card</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className={fieldErrors.cardName ? "input-error" : ""}
                  />
                  {fieldErrors.cardName && <p className="field-error">{fieldErrors.cardName}</p>}
                </div>
                <div className="field">
                  <label>Card number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className={fieldErrors.cardNumber ? "input-error" : ""}
                  />
                  {fieldErrors.cardNumber && <p className="field-error">{fieldErrors.cardNumber}</p>}
                </div>
                <div className="field">
                  <label>Expiry (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="08/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className={fieldErrors.cardExpiry ? "input-error" : ""}
                  />
                  {fieldErrors.cardExpiry && <p className="field-error">{fieldErrors.cardExpiry}</p>}
                </div>
                <div className="field">
                  <label>CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className={fieldErrors.cardCvc ? "input-error" : ""}
                  />
                  {fieldErrors.cardCvc && <p className="field-error">{fieldErrors.cardCvc}</p>}
                </div>
                <button type="submit">Pay & Book</button>
              </form>
            </section>
          )}

          {message && <p className="form-message success">{message}</p>}

          <section>
            <h2>My Passes</h2>
            {myPasses.length === 0 && <p>You have no passes yet.</p>}
            <ul>
              {myPasses.map((pass) => (
                <li key={pass.pass_id}>
                  {pass.type} - ${pass.price} ({formatDate(pass.valid_from)} to {formatDate(pass.valid_to)}) -{" "}
                  {pass.booking_status}{" "}
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