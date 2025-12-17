const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const exchangeRateRoutes = require('./routes/exchangeRateRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes'); // [NEW]

app.get('/', (req, res) => {
    res.send('HAYP Backend API is running');
});

app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/exchange-rates', exchangeRateRoutes);
app.use('/api/inventory', inventoryRoutes); // [NEW]

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
