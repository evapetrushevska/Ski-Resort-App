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

export const createRental = async (bookingId, equipmentId, rentalDate, returnDate) => {
  const [result] = await pool.query(
    `INSERT 
        INTO rental (booking_id, equipment_id, rental_date, return_date)
        VALUES (?, ?, ?, ?)`,
    [bookingId, equipmentId, rentalDate, returnDate]
  );
  return result;
};

export const getUserRentals = async (userId) => {
  const [rows] = await pool.query(
    `SELECT rental.*, equipment.equipment_name, equipment.type, booking.status AS booking_status
        FROM rental
        JOIN booking ON rental.booking_id = booking.booking_id
        JOIN equipment ON rental.equipment_id = equipment.equipment_id
        WHERE booking.user_id = ?`,
    [userId]
  );
  return rows;
};

//check before cancelling
export const getRentalById = async (rentalId) => {
  const [rows] = await pool.query(
    `SELECT rental.*, booking.user_id
        FROM rental
        JOIN booking ON rental.booking_id = booking.booking_id
        WHERE rental.rental_id = ?`,
    [rentalId]
  );
  if (rows.length === 0) return null;
  return rows[0];
};

export const cancelRental = async (bookingId) => {
  const [result] = await pool.query(
    `UPDATE booking 
        SET status = 'cancelled'
        WHERE booking_id = ?`,
    [bookingId]
  );
  return result;
};