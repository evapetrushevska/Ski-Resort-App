import pool from './database.js';

export const getAllEquipment = async () => {
  const [rows] = await pool.query(
    `SELECT * 
     FROM equipment`
  );
  return rows;
};

export const updateEquipmentStatus = async (equipmentId, availabilityStatus) => {
  const [result] = await pool.query(
    `UPDATE equipment 
        SET availability_status = ?
        WHERE equipment_id = ?`,
    [availabilityStatus, equipmentId]
  );
  return result;
};

export const createEquipment = async (name, type) => {
  const [result] = await pool.query(
    `INSERT 
        INTO equipment (name, type)
        VALUES (?, ?)`,
    [name, type]
  );
  return result;
};