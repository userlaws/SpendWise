const db = require('./db');

// Get all orders
const getAllOrders = async () => {
  const res = await db.query('SELECT * FROM orders');
  return res.rows;
};

// Get an order by ID
const getOrderById = async (orderId) => {
  const res = await db.query('SELECT * FROM orders WHERE order_id = $1', [
    orderId,
  ]);
  return res.rows[0];
};
