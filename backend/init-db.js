// Database initialization script
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Connecting to Prisma Postgres database...');
    
    // Test connection
    const result = await client.query('SELECT NOW()');
    console.log('✅ Connected successfully at:', result.rows[0].now);
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Running database schema...');
    await client.query(schema);
    
    console.log('✅ Database schema created successfully!');
    
    // Verify tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Created tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log('\n✅ Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('\n🎉 Ready to start the backend server!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to initialize database:', error);
    process.exit(1);
  });
