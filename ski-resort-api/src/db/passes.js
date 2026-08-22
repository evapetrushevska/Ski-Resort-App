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

export const createSkiPass = async (bookingId, type, price, validFrom, validTo) => {
  const [result] = await pool.query(
    `INSERT 
        INTO ski_pass (booking_id, type, price, valid_from, valid_to)
        VALUES (?, ?, ?, ?, ?)`,
    [bookingId, type, price, validFrom, validTo]
  );
  return result;
};

export const getUserPasses = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ski_pass.*, booking.status AS booking_status
        FROM ski_pass
        JOIN booking ON ski_pass.booking_id = booking.booking_id
        WHERE booking.user_id = ?`,
    [userId]
  );
  return rows;
};

export const getPassById = async (passId) => {
  const [rows] = await pool.query(
    `SELECT ski_pass.*, booking.user_id
        FROM ski_pass
        JOIN booking ON ski_pass.booking_id = booking.booking_id
        WHERE ski_pass.pass_id = ?`,
    [passId]
  );
  if (rows.length === 0) return null;
  return rows[0];
};

export const cancelPass = async (bookingId) => {
  const [result] = await pool.query(
    `UPDATE booking SET status = 'cancelled'
        WHERE booking_id = ?`,
    [bookingId]
  );
  return result;
};