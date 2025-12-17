
const db = require('./db');
const fs = require('fs');
const path = require('path');

const migrate = async () => {
    try {
        console.log("Starting migration...");
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Extract the products table creation part
        // We can't run the whole file because it might error on existing tables
        // So we'll just run the specific CREATE TABLE IF NOT EXISTS logic or just the new block.
        // Actually, let's just run the specific block for products.
        const productsSql = `
            CREATE TABLE IF NOT EXISTS products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_code VARCHAR(100) UNIQUE NOT NULL,
                name TEXT NOT NULL,
                brand VARCHAR(100),
                category VARCHAR(100),
                stock_quantity INTEGER DEFAULT 0,
                critical_stock_level INTEGER DEFAULT 5,
                buying_price DECIMAL(12,2),
                currency VARCHAR(3) DEFAULT 'TRY',
                last_synced_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;

        await db.query(productsSql);
        console.log("Migration successful: products table created.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
};

migrate();
