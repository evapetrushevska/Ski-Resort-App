import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    if (!password.trim()) errors.password = "Password is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setMessage("Please fix the highlighted fields.");
      setMessageType("error");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Login successful. Welcome, ${data.user.firstName}.`);
        setMessageType("success");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => navigate("/"), 800);
      } else {
        setMessage(data.message || "Login failed");
        setMessageType("error");
      }
    } catch (err) {
      console.log("Login error:", err);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleLogin} noValidate>
          <div className="field">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldErrors.email ? "input-error" : ""}
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>
          <div className="field">
            <label>Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldErrors.password ? "input-error" : ""}
            />
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>
          <button type="submit">Login</button>
        </form>
        {message && <p className={`form-message ${messageType}`}>{message}</p>}
      </section>
    </main>
  );
}