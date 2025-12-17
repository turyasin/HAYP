const db = require('../db');

exports.getAllSuppliers = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const { name, tax_office, tax_number, address, contact_person, phone, email, general_discount, logistics_method } = req.body;
        const { rows } = await db.query(
            `INSERT INTO suppliers (name, tax_office, tax_number, address, contact_person, phone, email, general_discount, logistics_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [name, tax_office, tax_number, address, contact_person, phone, email, general_discount, logistics_method]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
