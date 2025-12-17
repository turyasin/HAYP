const db = require('../db');

exports.getAllCustomers = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const { name, tax_office, tax_number, address, contact_person, phone, email, notes } = req.body;
        const { rows } = await db.query(
            `INSERT INTO customers (name, tax_office, tax_number, address, contact_person, phone, email, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, tax_office, tax_number, address, contact_person, phone, email, notes]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, tax_office, tax_number, address, contact_person, phone, email, notes, status } = req.body;
        const { rows } = await db.query(
            `UPDATE customers SET 
        name = $1, tax_office = $2, tax_number = $3, address = $4, 
        contact_person = $5, phone = $6, email = $7, notes = $8, status = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
            [name, tax_office, tax_number, address, contact_person, phone, email, notes, status, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM customers WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
