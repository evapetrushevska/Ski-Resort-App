import { useState, useEffect } from "react";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <main className="home-page">
      <h1>Ski Resort App</h1>
      {user ? (
        <p>Welcome back, {user.firstName}!</p>
      ) : (
        <p>Please log in or register to get started.</p>
      )}
    </main>
  );
}