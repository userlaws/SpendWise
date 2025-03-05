const db = require('./db');

// Get all users
const getAllUsers = async () => {
  const res = await db.query('SELECT * FROM users');
  return res.rows;
};

// Get a user by ID
const getUserById = async (userId) => {
  const res = await db.query('SELECT * FROM users WHERE user_id = $1', [
    userId,
  ]);
  return res.rows[0];
};

// Insert a new user
const createUser = async (username, password, email) => {
  const res = await db.query(
    'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
    [username, password, email]
  );
  return res.rows[0];
};

// Update user password
const updateUserPassword = async (userId, newPassword) => {
  const res = await db.query(
    'UPDATE users SET password = $1 WHERE user_id = $2 RETURNING *',
    [newPassword, userId]
  );
  return res.rows[0];
};
