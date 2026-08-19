import { useState } from "react";
import { API_URL } from "../config/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    
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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }else{
        setMessage(data.message || "Login failed");
      }
    }catch (err) {
      console.log("Login error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
      </section>
    </main>
  );
}