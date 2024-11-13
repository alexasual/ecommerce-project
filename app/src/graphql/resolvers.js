const { pool } = require('../config/db');
const redisClient = require('../config/redis');

const resolvers = {
  Query: {
    async products(_, { search = '', filter = '', limit = 10, offset = 0 }) {
      try {
        const cacheKey = `products_${search}_${filter}_${limit}_${offset}`;
        const cachedProducts = await redisClient.get(cacheKey);

        if (cachedProducts) {
          return JSON.parse(cachedProducts);
        }

        const searchQuery = search ? `name ILIKE '%${search}%'` : 'TRUE';
        const filterQuery = filter ? `AND category = '${filter}'` : '';
        const query = `
          SELECT * FROM products 
          WHERE ${searchQuery} ${filterQuery} 
          LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);

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

        await redisClient.setex(cacheKey, 3600, JSON.stringify(result.rows[0])); // Cache for 1 hour

        return result.rows[0];
      } catch (err) {
        console.error('Error fetching product:', err);
        throw new Error('Failed to fetch product');
      }
    },
  },

  Mutation: {
    async createProduct(_, { name, description, category, quantity, price, imageUrl }) {
      try {
        const result = await pool.query(
          'INSERT INTO products (name, description, category, quantity, price, imageUrl) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [name, description, category, quantity, price, imageUrl]
        );
        const newProduct = result.rows[0];

        // Invalidate cache
        await redisClient.del('products_*');

        return newProduct;
      } catch (err) {
        console.error('Error creating product:', err);
        throw new Error('Failed to create product');
      }
    },

    async updateProduct(_, { id, name, description, category, quantity, price, imageUrl }) {
      try {
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
        if (category !== undefined) {
          updates.push(`category = $${paramCount}`);
          values.push(category);
          paramCount++;
        }
        if (quantity !== undefined) {
          updates.push(`quantity = $${paramCount}`);
          values.push(quantity);
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

        // Invalidate cache
        await redisClient.del(`product_${id}`);
        await redisClient.del('products_*');

        return result.rows[0];
      } catch (err) {
        console.error('Error updating product:', err);
        throw new Error('Failed to update product');
      }
    },

    async deleteProduct(_, { id }) {
      try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
          throw new Error(`Product with id ${id} not found`);
        }

        // Invalidate cache
        await redisClient.del(`product_${id}`);
        await redisClient.del('products_*');

        return true;
      } catch (err) {
        console.error('Error deleting product:', err);
        throw new Error('Failed to delete product');
      }
    },
  },
};

module.exports = resolvers;