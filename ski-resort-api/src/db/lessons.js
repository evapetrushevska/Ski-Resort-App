import pool from './database.js';

export const createBooking = async (userId) => {
  const [result] = await pool.query(
    `INSERT 
        INTO booking (user_id, status)
        VALUES (?, 'pending')`,
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
          AND booking.status NOT IN ('cancelled', 'declined')`,
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
    `SELECT lesson.*, slope.slope_name, user.first_name AS instructor_first_name,
            user.last_name AS instructor_last_name, booking.status AS booking_status
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

//lessons booked with a specific instructor (by their instructor_id)
export const getInstructorSchedule = async (instructorId) => {
  const [rows] = await pool.query(
    `SELECT lesson.*, slope.slope_name, user.first_name AS visitor_first_name,
            user.last_name AS visitor_last_name, booking.status AS booking_status
        FROM lesson
        JOIN booking ON lesson.booking_id = booking.booking_id
        JOIN slope ON lesson.slope_id = slope.slope_id
        JOIN user ON booking.user_id = user.user_id
        WHERE lesson.instructor_id = ?
        ORDER BY lesson.date, lesson.time`,
    [instructorId]
  );
  return rows;
};

// find the instructor_id belonging to a given user_id
export const getInstructorIdByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT instructor_id 
        FROM instructor WHERE user_id = ?`,
    [userId]
  );
  if (rows.length === 0) return null;
  return rows[0].instructor_id;
};

// every lesson in the system, for admin review
export const getAllLessonsForAdmin = async () => {
  const [rows] = await pool.query(
    `SELECT lesson.*, slope.slope_name, booking.status AS booking_status,
            visitor.first_name AS visitor_first_name, visitor.last_name AS visitor_last_name,
            instructor_user.first_name AS instructor_first_name, instructor_user.last_name AS instructor_last_name
        FROM lesson
        JOIN booking ON lesson.booking_id = booking.booking_id
        JOIN slope ON lesson.slope_id = slope.slope_id
        JOIN user visitor ON booking.user_id = visitor.user_id
        JOIN instructor ON lesson.instructor_id = instructor.instructor_id
        JOIN user instructor_user ON instructor.user_id = instructor_user.user_id
        ORDER BY lesson.date, lesson.time`
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

// accept/decline check ownership
export const getLessonWithInstructor = async (lessonId) => {
  const [rows] = await pool.query(
    `SELECT lesson.*, instructor.user_id AS instructor_user_id
        FROM lesson
        JOIN instructor ON lesson.instructor_id = instructor.instructor_id
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

//accept/decline 
export const respondToLesson = async (bookingId, newStatus) => {
  const [result] = await pool.query(
    `UPDATE booking SET status = ?
        WHERE booking_id = ?`,
    [newStatus, bookingId]
  );
  return result;
};