const { pool } = require('../config/db');
const redisClient = require('../config/redis');

const resolvers = {
  Query: {
    async products(_, { limit = 10, offset = 0 }) {
      try {
        const cacheKey = `products_${limit}_${offset}`;
        const cachedProducts = await redisClient.get(cacheKey);

        if (cachedProducts) {
          return JSON.parse(cachedProducts);
        }

        const result = await pool.query('SELECT * FROM products LIMIT $1 OFFSET $2', [limit, offset]);
        await redisClient.setex(cacheKey, 3600, JSON.stringify(result.rows)); // Cache for 1 hour

        return result.rows;
      } catch (err) {
        console.error('Error fetching products:', err);
        throw new Error('Failed to fetch products');
      }
    },

    async product(_, { id }) {
      try {
        const cacheKey = `product_${id}`;
        const cachedProduct = await redisClient.get(cacheKey);

        if (cachedProduct) {
          return JSON.parse(cachedProduct);
        }

        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          throw new Error('Product not found');
        }

        await redisClient.setex(cacheKey, 3600, JSON.stringify(result.rows[0])); 

        return result.rows[0];
      } catch (err) {
        console.error('Error fetching product:', err);
        throw new Error('Failed to fetch product');
      }
    },
  },

  Mutation: {
    async createProduct(_, { name, description, price, imageUrl }) {
      try {
      
        if (!name || !price) {
          throw new Error('Name and price are required');
        }

      
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'products'
          );
        `);

        if (!tableCheck.rows[0].exists) {
     
          await pool.query(`
            CREATE TABLE products (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              price DECIMAL(10, 2) NOT NULL,
              imageUrl VARCHAR(255)
            );
          `);
        }

       
        const result = await pool.query(
          'INSERT INTO products (name, description, price, imageUrl) VALUES ($1, $2, $3, $4) RETURNING *',
          [name, description, price, imageUrl]
        );

        const newProduct = result.rows[0];

    
        try {
          await redisClient.del('products_*');
        } catch (cacheErr) {
          console.error('Cache invalidation failed:', cacheErr);
         
        }

        return newProduct;
      } catch (err) {
        console.error('Error creating product:', err);
        throw new Error(`Failed to create product: ${err.message}`);
      }
    },

    async updateProduct(_, { id, name, description, price, imageUrl }) {
      try {
    
        const existingProduct = await pool.query(
          'SELECT * FROM products WHERE id = $1',
          [id]
        );

        if (existingProduct.rows.length === 0) {
          throw new Error(`Product with id ${id} not found`);
        }

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
          updates.push(`name = $${paramCount}`);
          values.push(name);
          paramCount++;
        }
        if (description !== undefined) {
          updates.push(`description = $${paramCount}`);
          values.push(description);
          paramCount++;
        }
        if (price !== undefined) {
          updates.push(`price = $${paramCount}`);
          values.push(price);
          paramCount++;
        }
        if (imageUrl !== undefined) {
          updates.push(`imageUrl = $${paramCount}`);
          values.push(imageUrl);
          paramCount++;
        }

        values.push(id);

        const updateQuery = `
          UPDATE products 
          SET ${updates.join(', ')} 
          WHERE id = $${paramCount}
          RETURNING *
        `;

        const result = await pool.query(updateQuery, values);

       
        try {
          await redisClient.del(`product_${id}`);
          await redisClient.del('products_*');
        } catch (cacheErr) {
          console.error('Cache invalidation failed:', cacheErr);
        }

        return result.rows[0];
      } catch (err) {
        console.error('Error updating product:', err);
        throw new Error(`Failed to update product: ${err.message}`);
      }
    },

    async deleteProduct(_, { id }) {
      try {
        
        const existingProduct = await pool.query(
          'SELECT * FROM products WHERE id = $1',
          [id]
        );

        if (existingProduct.rows.length === 0) {
          throw new Error(`Product with id ${id} not found`);
        }

        
        const result = await pool.query(
          'DELETE FROM products WHERE id = $1 RETURNING *',
          [id]
        );

        
        try {
          await redisClient.del(`product_${id}`);
          await redisClient.del('products_*');
        } catch (cacheErr) {
          console.error('Cache invalidation failed:', cacheErr);
          
        }

        return true;
      } catch (err) {
        console.error('Error deleting product:', err);
        throw new Error(`Failed to delete product: ${err.message}`);
      }
    }
  }
};

module.exports = resolvers;