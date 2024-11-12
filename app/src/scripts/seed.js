require('dotenv').config();
const { pool } = require('../config/db');

const seedDatabase = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      imageUrl VARCHAR(255)
    );
  `;

  const insertProductsQuery = `
    INSERT INTO products (name, description, price, imageUrl)
    VALUES
      ('Product 1', 'Description for product 1', 19.99, 'http://example.com/image1.jpg'),
      ('Product 2', 'Description for product 2', 29.99, 'http://example.com/image2.jpg'),
      ('Product 3', 'Description for product 3', 39.99, 'http://example.com/image3.jpg')
    ON CONFLICT DO NOTHING;
  `;

  try {

    await pool.query(createTableQuery);
    console.log('Products table created or already exists.');

    await pool.query(insertProductsQuery);
    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    pool.end();
  }
};

seedDatabase();