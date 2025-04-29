const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const iotRoutes = require('./routes/iotRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authenticateToken = require('./middlewares/authenticateToken');
const cors = require('cors'); 
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const backupDir = path.join(__dirname, 'backups');
const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/iot', iotRoutes);

app.use(authenticateToken);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orderitems', orderItemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
