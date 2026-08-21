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

export const createEquipment = async (equipmentName, type) => {
  const [result] = await pool.query(
    `INSERT 
        INTO equipment (equipment_name, type)
        VALUES (?, ?)`,
    [equipmentName, type]
  );
  return result;
};