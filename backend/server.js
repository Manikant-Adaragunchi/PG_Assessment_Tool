const dotenv = require('dotenv');
// Load ENV before anything else
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initializeFirebase } = require('./src/config/firebase');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Initialize Firebase
initializeFirebase();

const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1)); 
});
