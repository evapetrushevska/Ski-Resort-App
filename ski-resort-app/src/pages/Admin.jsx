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

export default function Admin() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const loadReports = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReports(data);
      } else {
        setMessage("Could not load reports.");
      }
    } catch (err) {
      console.log("Error loading reports:", err);
      setMessage("Could not load reports.");
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async () => {
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/admin/reports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Report generated.");
        loadReports();
      } else {
        setMessage("Could not generate report.");
      }
    } catch (err) {
      console.log("Generate report error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (!user) {
    return (
      <main className="admin-page">
        <h1>Admin Dashboard</h1>
        <p>Please log in as an admin to view this page.</p>
      </main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main className="admin-page">
        <h1>Admin Dashboard</h1>
        <p>You do not have access to this page.</p>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <h1>Admin Dashboard</h1>

      <section>
        <button onClick={handleGenerate}>Generate New Report</button>
      </section>

      {message && <p>{message}</p>}

      <section>
        <h2>Report History</h2>
        {reports.length === 0 && <p>No reports generated yet.</p>}
        <ul>
          {reports.map((report) => (
            <li key={report.report_id}>
              {formatDate(report.generated_at)} - Total Bookings: {report.total_bookings} - Total Revenue: $
              {report.total_revenue}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}