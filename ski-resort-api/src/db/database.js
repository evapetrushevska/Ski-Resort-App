import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT user.*, role.role_name
     FROM user
     JOIN role ON user.role_id = role.role_id
     WHERE user.email = ?`,
    [email]
  );
  return rows;
};

export const getRoleIdByName = async (roleName) => {
  const [rows] = await pool.query(
    `SELECT role_id 
     FROM role 
     WHERE role_name = ?`,
    [roleName]
  );
  if (rows.length === 0) return null;
  return rows[0].role_id;
};

export const createUser = async (firstName, lastName, email, hashedPassword, roleId) => {
  const [result] = await pool.query(
    `INSERT INTO user (first_name, last_name, email, password, role_id) 
     VALUES (?, ?, ?, ?, ?)`,
    [firstName, lastName, email, hashedPassword, roleId]
  );
  return result;
};

export default pool;