const { Pool } = require('pg');

// Create a new pool instance
const pool = new Pool({
  user: process.env.DB_USER, // Your database username
  host: process.env.DB_HOST, // Your database host
  database: process.env.DB_NAME, // Your database name
  password: process.env.DB_PASSWORD, // Your database password
  port: process.env.DB_PORT, // Your database port
});

// Function to query the database
const query = (text, params) => pool.query(text, params);

// Export the pool and query function
module.exports = {
  query,
  pool,
};
