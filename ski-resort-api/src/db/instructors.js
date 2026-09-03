import pool from './database.js';

export const createInstructor = async (userId, specialization) => {
  const [result] = await pool.query(
    `INSERT
        INTO instructor (user_id, specialization)
        VALUES (?, ?)`,
    [userId, specialization]
  );
  return result;
};

export const getAllInstructors = async () => {
  const [rows] = await pool.query(
    `SELECT instructor.instructor_id, instructor.specialization, user.first_name, user.last_name
        FROM instructor
        JOIN user ON instructor.user_id = user.user_id`
  );
  return rows;
};