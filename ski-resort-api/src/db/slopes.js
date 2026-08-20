import pool from './database.js';

export const getAllSlopes = async () => {
  const [rows] = await pool.query(
    `SELECT slope.*, weather.temperature, weather.condition, weather.updated_at
        FROM slope
        LEFT JOIN weather ON slope.slope_id = weather.slope_id`
  );
  return rows;
};

export const updateSlopeStatus = async (slopeId, status) => {
  const [result] = await pool.query(
    `UPDATE slope SET status = ? 
        WHERE slope_id = ?`,
    [status, slopeId]
  );
  return result;
};

export const updatetWeather = async (slopeId, temperature, condition) => {
  const [existing] = await pool.query(
    `SELECT weather_id
        FROM weather 
        WHERE slope_id = ?`,
    [slopeId]
  );

  if (existing.length > 0) {
    const [result] = await pool.query(
      `UPDATE weather SET temperature = ?, condition = ?, updated_at = NOW() 
            WHERE slope_id = ?`,
      [temperature, condition, slopeId]
    );
    return result;
  } else {
    const [result] = await pool.query(
      `INSERT INTO weather (slope_id, temperature, condition) 
            VALUES (?, ?, ?)`,
      [slopeId, temperature, condition]
    );
    return result;
  }
};