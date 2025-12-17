const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // We need axios to trigger n8n webhook

// Configure storage for local temp save (or memory)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

exports.uploadMiddleware = upload.single('file');

exports.uploadProductList = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { supplierId } = req.body;

        // Log the upload to database
        const { rows } = await db.query(
            `INSERT INTO product_list_updates (supplier_id, file_name, file_type, upload_date)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [supplierId, req.file.originalname, path.extname(req.file.originalname)]
        );

        const updateLog = rows[0];

        // Trigger n8n Webhook here (if n8n URL involves file processing)
        // For now, we simulate success response
        // const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        // await axios.post(n8nWebhookUrl, { ... });

        res.status(200).json({
            message: 'File uploaded successfully and processing started.',
            file: req.file,
            logId: updateLog.id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProductsBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;
        // In real scenario, this might fetch from Google Sheets via an internal sync table
        // For now, let's assume we have a local cache or similar
        res.json([]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
