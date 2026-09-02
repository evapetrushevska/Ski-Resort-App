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

  const [selectedOption, setSelectedOption] = useState(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const visibleOptions =
    user && user.role === "instructor"
      ? PASS_OPTIONS.filter((option) => !option.type.toLowerCase().includes("kids"))
      : PASS_OPTIONS;

  const loadMyPasses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/passes/my`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handlePassesDate = (value) => {
    setValidFrom(value);
    if (validTo && value && validTo < value) {
      setValidTo("");
    }
  };

  const handleSelectPass = (option) => {
    setSelectedOption(option);
    setMessage("");
  };

  const handlePay = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please log in to book a pass.");
      return;
    }

    if (!validFrom || !validTo) {
      setMessage("Please choose valid from and valid to dates.");
      return;
    }

    if (validTo < validFrom) {
      setMessage("Valid to date cannot be before the valid from date.");
      return;
    }

    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      setMessage("Please fill in all payment details.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/passes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: selectedOption.type,
          price: selectedOption.price,
          validFrom,
          validTo,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Payment successful. Pass booked.");
        setSelectedOption(null);
        setCardName("");
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
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

      {!token && <p>Please log in to book a ski pass.</p>}

      {token && (
        <>
          <section>
            <h2>Choose your dates</h2>
            <div>
              <label>Valid from</label>
              <input type="date" value={validFrom} onChange={(e) => handlePassesDate(e.target.value)} />
            </div>
            <div>
              <label>Valid to</label>
              <input
                type="date"
                value={validTo}
                min={validFrom || undefined}
                disabled={!validFrom}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </div>
          </section>

          <section>
            <h2>Available Passes</h2>
            <ul>
              {visibleOptions.map((option) => (
                <li key={option.type}>
                  {option.type} - ${option.price}{" "}
                  <button onClick={() => handleSelectPass(option)}>Select</button>
                </li>
              ))}
            </ul>
          </section>

          {selectedOption && (
            <section>
              <h2>Payment Details</h2>
              <p>
                Paying ${selectedOption.price} for {selectedOption.type}
              </p>
              <form onSubmit={handlePay}>
                <div>
                  <label>Name on card</label>
                  <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                </div>
                <div>
                  <label>Card number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label>Expiry (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="08/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <label>CVC</label>
                  <input type="text" placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                </div>
                <button type="submit">Pay & Book</button>
              </form>
            </section>
          )}

          {message && <p>{message}</p>}

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