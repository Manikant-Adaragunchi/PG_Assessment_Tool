const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./config/logger');

const adminRoutes = require('./routes/admin.routes');
const evaluationRoutes = require('./routes/evaluation.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - ${req.ip}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'PG Assessment Tool Backend API', status: 'Running' });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', adminRoutes);
app.use('/api', evaluationRoutes);
app.use('/api/performance', require('./routes/performance.routes'));

// Error Handling
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ success: false, error: 'Server Error' });
});

module.exports = app;
