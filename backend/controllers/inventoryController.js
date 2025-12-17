const { google } = require('googleapis');
const db = require('../db');
const path = require('path');

// Path to your service account key file
// Adjust relative path as needed
const KEY_PATH = path.join(__dirname, '../../resources/hayp-platform-7af768985d05.json');

// Scopes required
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const getAuthClient = async () => {
    // Priority 1: Environment Variable (For Cloud/Render)
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: SCOPES,
            });
            return await auth.getClient();
        } catch (e) {
            console.error("Failed to parse GOOGLE_CREDENTIALS_JSON", e);
        }
    }

    // Priority 2: Local File (For Development)
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: SCOPES,
    });
    return await auth.getClient();
};

// Sync logic
exports.syncWithGoogleSheets = async (req, res) => {
    const { spreadsheetId, range } = req.body;

    if (!spreadsheetId) {
        return res.status(400).json({ error: 'Spreadsheet ID required' });
    }

    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: range || 'Sayfa1!A2:H',
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.json({ message: 'No data found in sheet.' });
        }

        // 1. Prepare data for bulk insert
        const validRows = [];
        const now = new Date();

        for (const row of rows) {
            const [code, name, brand, category, qty, price, currency, critical] = row;
            // Skip rows without essential data
            if (!code || !name) continue;

            const safePrice = parseFloat((price || '0').toString().replace(',', '.')) || 0;
            const safeQty = parseInt(qty) || 0;
            const safeCritical = parseInt(critical) || 5;
            const safeCurrency = currency || 'TRY';

            validRows.push([
                code.trim(),
                name.trim(),
                brand ? brand.trim() : null,
                category ? category.trim() : null,
                safeQty,
                safePrice,
                safeCurrency,
                safeCritical,
                now
            ]);
        }

        if (validRows.length === 0) {
            return res.json({ message: 'No valid rows found to sync.' });
        }

        // 2. Perform Bulk Upsert using Transaction
        // PostgreSQL doesn't support generic BULK INSERT like MySQL in one line easily with conflict handling for all columns 
        // without constructing a massive string or using unnest. 
        // Using 'unnest' pattern is efficient and safe.

        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // We use unnest to pass arrays of data
            // Columns: code, name, brand, category, qty, price, currency, critical, synced_at

            // Transpose columns
            const codes = validRows.map(r => r[0]);
            const names = validRows.map(r => r[1]);
            const brands = validRows.map(r => r[2]);
            const categories = validRows.map(r => r[3]);
            const qtys = validRows.map(r => r[4]);
            const prices = validRows.map(r => r[5]);
            const currencies = validRows.map(r => r[6]);
            const criticals = validRows.map(r => r[7]);

            // Query: Upsert from unnest
            const queryText = `
                INSERT INTO products (
                    product_code, name, brand, category, 
                    stock_quantity, buying_price, currency, 
                    critical_stock_level, last_synced_at
                )
                SELECT * FROM unnest(
                    $1::text[], $2::text[], $3::text[], $4::text[], 
                    $5::int[], $6::decimal[], $7::text[], 
                    $8::int[], ARRAY_FILL(NOW(), ARRAY[${validRows.length}])
                ) AS t(product_code, name, brand, category, stock_quantity, buying_price, currency, critical_stock_level, last_synced_at)
                ON CONFLICT (product_code) DO UPDATE SET
                    name = EXCLUDED.name,
                    brand = EXCLUDED.brand,
                    category = EXCLUDED.category,
                    stock_quantity = EXCLUDED.stock_quantity,
                    buying_price = EXCLUDED.buying_price,
                    currency = EXCLUDED.currency,
                    critical_stock_level = EXCLUDED.critical_stock_level,
                    last_synced_at = EXCLUDED.last_synced_at;
            `;

            await client.query(queryText, [
                codes, names, brands, categories, qtys, prices, currencies, criticals
            ]);

            await client.query('COMMIT');

            // Release client back to pool
            client.release();

            res.json({ success: true, message: `Synced ${validRows.length} items successfully.`, count: validRows.length });

        } catch (dbError) {
            await client.query('ROLLBACK');
            client.release();
            throw dbError;
        }

    } catch (error) {
        console.error('Sync Error Full:', error);
        const errorMsg = error.response?.data?.error?.message || error.message;
        res.status(500).json({ error: 'Failed to sync', details: errorMsg });
    }
};

exports.getInventory = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Get Inventory Error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
};
