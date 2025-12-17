const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.warn('WARNING: Database connection failed. Improve .env config.');
        console.error(err.message);
    } else {
        console.log('Database connected successfully.');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool, // Expose pool for transactions
};
