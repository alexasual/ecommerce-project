require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT NOW()');
      console.log('Database connected successfully');
      return;
    } catch (err) {
      console.error(`Database connection failed. Retrying in ${delay / 1000} seconds...`, err);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to connect to the database after multiple attempts');
};

connectWithRetry();

module.exports = { pool };