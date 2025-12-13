const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const logger = require('../config/logger');

dotenv.config({ path: '../../.env' });

const seedHOD = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-assessment-tool');

        const hodUid = 'HOD_MOCK_123';

        // Check if exists
        const exists = await User.findOne({ firebaseUid: hodUid });
        if (exists) {
            console.log('HOD already seeded.');
            process.exit();
        }

        await User.create({
            firebaseUid: hodUid,
            fullName: 'Dr. Head of Department',
            email: 'hod@hospital.edu',
            role: 'HOD'
        });

        console.log(`Seeded HOD User. UID: ${hodUid}`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedHOD();
