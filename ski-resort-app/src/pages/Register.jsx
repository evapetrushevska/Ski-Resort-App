import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("visitor");
  const [specialization, setSpecialization] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [phone, setPhone] = useState("");

  const validate = () => {
    const errors = {};
    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    if (!password.trim()) errors.password = "Password is required.";
    if (role === "instructor" && !specialization.trim()) {
      errors.specialization = "Specialization is required for instructors.";
    }
    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setMessage("Please fix the highlighted fields.");
      setMessageType("error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
          role,
          specialization: role === "instructor" ? specialization : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful. Redirecting to login...");
        setMessageType("success");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setMessage(data.message || "Registration failed.");
        setMessageType("error");
      }
    } catch (err) {
      console.log("Register error:", err);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <h1>Register</h1>
        <form onSubmit={handleRegister} noValidate>
          <div className="field">
            <label>First name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={fieldErrors.firstName ? "input-error" : ""}
            />
            {fieldErrors.firstName && <p className="field-error">{fieldErrors.firstName}</p>}
          </div>
          <div className="field">
            <label>Last name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={fieldErrors.lastName ? "input-error" : ""}
            />
            {fieldErrors.lastName && <p className="field-error">{fieldErrors.lastName}</p>}
          </div>
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
          <div className="field">
            <label>Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="field">
            <label>I am registering as *</label>
            <div className="role-toggle">
              <button
                type="button"
                className={role === "visitor" ? "role-option active" : "role-option"}
                onClick={() => setRole("visitor")}
              >
                Visitor
              </button>
              <button
                type="button"
                className={role === "instructor" ? "role-option active" : "role-option"}
                onClick={() => setRole("instructor")}
              >
                Instructor
              </button>
            </div>
          </div>
          {role === "instructor" && (
            <div className="field">
              <label>Specialization *</label>
              <input
                type="text"
                placeholder="e.g. Alpine skiing, Snowboarding"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className={fieldErrors.specialization ? "input-error" : ""}
              />
              {fieldErrors.specialization && (
                <p className="field-error">{fieldErrors.specialization}</p>
              )}
            </div>
          )}
          <button type="submit">Register</button>
        </form>
        {message && <p className={`form-message ${messageType}`}>{message}</p>}
      </section>
    </main>
  );
}