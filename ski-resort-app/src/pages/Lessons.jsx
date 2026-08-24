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

export default function Lessons() {
  const [instructors, setInstructors] = useState([]);
  const [slopes, setSlopes] = useState([]);
  const [myLessons, setMyLessons] = useState([]);
  const [message, setMessage] = useState("");

  const [instructorId, setInstructorId] = useState("");
  const [slopeId, setSlopeId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const token = localStorage.getItem("token");

  const loadInstructors = async () => {
    try {
      const res = await fetch(`${API_URL}/instructors`);
      const data = await res.json();
      setInstructors(data);
    } catch (err) {
      console.log("Error loading instructors:", err);
    }
  };

  const loadSlopes = async () => {
    try {
      const res = await fetch(`${API_URL}/slopes`);
      const data = await res.json();
      setSlopes(data);
    } catch (err) {
      console.log("Error loading slopes:", err);
    }
  };

  const loadMyLessons = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/lessons/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMyLessons(data);
      }
    } catch (err) {
      console.log("Error loading lessons:", err);
    }
  };

  useEffect(() => {
    loadInstructors();
    loadSlopes();
    loadMyLessons();
  }, []);

  const handleBook = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please log in to book a lesson.");
      return;
    }

    if (!instructorId || !slopeId || !date || !time) {
      setMessage("Please choose an instructor, slope, date and time.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ instructorId, slopeId, date, time, capacity: 1 }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Lesson booked successfully.");
        loadMyLessons();
      } else {
        setMessage("Booking failed.");
      }
    } catch (err) {
      console.log("Booking error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleCancel = async (lessonId) => {
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Lesson cancelled.");
        loadMyLessons();
      } else {
        setMessage("Cancel failed.");
      }
    } catch (err) {
      console.log("Cancel error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="lessons-page">
      <h1>Ski & Snowboard Lessons</h1>

      {!token && <p>Please log in to book a lesson.</p>}

      {token && (
        <>
          <section>
            <h2>Book a Lesson</h2>
            <form onSubmit={handleBook}>
              <div>
                <label>Instructor</label>
                <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)}>
                  <option value="">-- Choose an instructor --</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.instructor_id} value={instructor.instructor_id}>
                      {instructor.first_name} {instructor.last_name} ({instructor.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Slope</label>
                <select value={slopeId} onChange={(e) => setSlopeId(e.target.value)}>
                  <option value="">-- Choose a slope --</option>
                  {slopes.map((slope) => (
                    <option key={slope.slope_id} value={slope.slope_id}>
                      {slope.slope_name} ({slope.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div>
                <label>Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>

              <button type="submit">Book Lesson</button>
            </form>
          </section>

          {message && <p>{message}</p>}

          <section>
            <h2>My Lessons</h2>
            {myLessons.length === 0 && <p>You have no lessons booked yet.</p>}
            <ul>
              {myLessons.map((lesson) => (
                <li key={lesson.lesson_id}>
                  {lesson.slope_name} with {lesson.instructor_first_name} {lesson.instructor_last_name} -{" "}
                  {formatDate(lesson.date)} at {lesson.time} - {lesson.booking_status}{" "}
                  {lesson.booking_status !== "cancelled" && (
                    <button onClick={() => handleCancel(lesson.lesson_id)}>Cancel</button>
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

