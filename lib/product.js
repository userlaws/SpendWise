const db = require('./db');

// Get all products
const getAllProducts = async () => {
    const res = await db.query('SELECT * FROM products');
    return res.rows;
};

// Get a product by ID
const getProductById = async (productId) => {
    const res = await db.query('SELECT * FROM products WHERE product_id = $1', [productId]);
    return res.rows[0];
};

// Insert a new product
const createProduct = async (name, description, price, imageUrl) => {
    const res = await db.query(
        'INSERT INTO products (name, description, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, price, imageUrl]
    );
    return res.rows[0];
}; 
  return res.rows[0];
};
