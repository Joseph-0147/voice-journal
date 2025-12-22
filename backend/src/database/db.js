const { Pool } = require('pg');

/**
 * Database connection pool
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Query helper
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
const getClient = async () => {
  const client = await pool.connect();
  
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout for acquiring client
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  client.release = () => {
    clearTimeout(timeout);
    client.release();
  };
  
  return { query, release };
};

module.exports = {
  query,
  getClient,
  pool,
};
