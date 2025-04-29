const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');
const bodyParser = require('body-parser');
const cors = require('cors');
const ensureAdminExists = require('./createAdmin');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

connectDB();

app.use(bodyParser.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

ensureAdminExists();

const animalRoutes = require('./routes/animals');
const healthRecordRoutes = require('./routes/healthRecords');
const appointmentRoutes = require('./routes/appointments');
const vetRoutes = require('./routes/vets');
const ownerRoutes = require('./routes/owners');
const authRoutes = require('./routes/auth');
const iotRoutes = require('./routes/iot');

app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/animals', authMiddleware, animalRoutes);
app.use('/api/healthrecords', authMiddleware, healthRecordRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api/vets', authMiddleware, roleMiddleware(['admin']), vetRoutes);
app.use('/api/owners', authMiddleware, roleMiddleware(['admin', 'vet']), ownerRoutes);
app.use('/api/iot', iotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
