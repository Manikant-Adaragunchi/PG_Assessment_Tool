const mongoose = require('mongoose');
const dotenv = require('dotenv');
const EvaluationModule = require('../models/EvaluationModule');
const modulesData = require('./modules.json');
const logger = require('../config/logger');

dotenv.config({ path: '../../.env' }); // Adjust path if needed

const seedModules = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-assessment-tool');
        logger.info('MongoDB Connected for Seeding');

        // Clear existing modules
        await EvaluationModule.deleteMany({});
        logger.info('Cleared existing Evaluation Modules');

        // Insert new modules
        await EvaluationModule.insertMany(modulesData);
        logger.info(`Seeded ${modulesData.length} Evaluation Modules successfully`);

        process.exit();
    } catch (error) {
        logger.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedModules();
