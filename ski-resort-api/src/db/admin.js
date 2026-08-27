import pool from './database.js';

//live current totals 
export const getLiveSummary = async () => {
  const [bookingRows] = await pool.query(
    `SELECT COUNT(*) AS total_bookings FROM booking WHERE status != 'cancelled'`
  );
  const totalBookings = bookingRows[0].total_bookings;

  const [revenueRows] = await pool.query(
    `SELECT COALESCE(SUM(ski_pass.price), 0) AS total_revenue
        FROM ski_pass
        JOIN booking ON ski_pass.booking_id = booking.booking_id
        WHERE booking.status != 'cancelled'`
  );
  const totalRevenue = revenueRows[0].total_revenue;

  return { totalBookings, totalRevenue };
};

//current totals
export const generateReport = async (userId) => {
  const [bookingRows] = await pool.query(
    `SELECT COUNT(*) AS total_bookings FROM booking WHERE status != 'cancelled'`
  );
  const totalBookings = bookingRows[0].total_bookings;

  const [revenueRows] = await pool.query(
    `SELECT COALESCE(SUM(ski_pass.price), 0) AS total_revenue
        FROM ski_pass
        JOIN booking ON ski_pass.booking_id = booking.booking_id
        WHERE booking.status != 'cancelled'`
  );
  const totalRevenue = revenueRows[0].total_revenue;

  const [result] = await pool.query(
    `INSERT INTO admin_report (user_id, total_revenue, total_bookings, notes)
        VALUES (?, ?, ?, ?)`,
    [userId, totalRevenue, totalBookings, "Auto-generated report"]
  );

  return { reportId: result.insertId, totalBookings, totalRevenue };
};

//previously generated reports
export const getAllReports = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM admin_report ORDER BY generated_at DESC`
  );
  return rows;
};