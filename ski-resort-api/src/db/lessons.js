import pool from './database.js';

export const createBooking = async (userId) => {
  const [result] = await pool.query(
    `INSERT 
        INTO booking (user_id, status)
        VALUES (?, 'confirmed')`,
    [userId]
  );
  return result.insertId;
};

//is instructor busy(booked)?
export const isInstructorBusy = async (instructorId, date, time) => {
  const [rows] = await pool.query(
    `SELECT lesson.lesson_id
        FROM lesson
        JOIN booking ON lesson.booking_id = booking.booking_id
        WHERE lesson.instructor_id = ?
          AND lesson.date = ?
          AND lesson.time = ?
          AND booking.status != 'cancelled'`,
    [instructorId, date, time]
  );
  return rows.length > 0;
};

export const createLesson = async (bookingId, instructorId, slopeId, date, time, capacity) => {
  const [result] = await pool.query(
    `INSERT 
        INTO lesson (booking_id, instructor_id, slope_id, date, time, capacity)
        VALUES (?, ?, ?, ?, ?, ?)`,
    [bookingId, instructorId, slopeId, date, time, capacity]
  );
  return result;
};

//all lessons belonging to a specific user
export const getUserLessons = async (userId) => {
  const [rows] = await pool.query(
    `SELECT lesson.*, slope.slope_name, user.first_name AS instructor_first_name, user.last_name AS instructor_last_name, booking.status AS booking_status
        FROM lesson
        JOIN booking ON lesson.booking_id = booking.booking_id
        JOIN slope ON lesson.slope_id = slope.slope_id
        JOIN instructor ON lesson.instructor_id = instructor.instructor_id
        JOIN user ON instructor.user_id = user.user_id
        WHERE booking.user_id = ?`,

    [userId]
  );
  return rows;
};

//a single lesson by id, to check ownership before cancelling
export const getLessonById = async (lessonId) => {
  const [rows] = await pool.query(
    `SELECT lesson.*, booking.user_id
        FROM lesson
        JOIN booking ON lesson.booking_id = booking.booking_id
        WHERE lesson.lesson_id = ?`,
    [lessonId]
  );
  if (rows.length === 0) return null;
  return rows[0];
};


export const cancelLesson = async (bookingId) => {
  const [result] = await pool.query(
    `UPDATE booking SET status = 'cancelled'
        WHERE booking_id = ?`,
    [bookingId]
  );
  return result;
};